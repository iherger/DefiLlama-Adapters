const sdk = require('@defillama/sdk');
const axios = require('axios')
const {staking} = require('../helper/staking')
//Arbitrum
const VAULT = '0x489ee077994B6658eAfA855C308275EAd8097C4A';
const STAKING = '0x908C4D94D34924765f1eDc22A1DD098397c59dD4';
const GMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const WBTC = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
const USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';
const USDT = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9';
const LINK = '0xf97f4df75117a78c1a5a0dbb814af92458539fb4';
const UNI = '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0';
const MIM = '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a';
const FRAX = '0x17fc002b466eec40dae837fc4be5c67993ddbd6f';
const DAI = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1';
//const AAVE = ''; Arbitrum address TBD
const SPELL = '0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af';
const SUSHI = '0xd4d42f0b6def4ce0383636770ef773390d85c61a';
// BSC
const apiEndpoint = 'https://gambit-server-staging.uc.r.appspot.com/tokens'
const pool = "0xc73A8DcAc88498FD4b4B1b2AaA37b0a2614Ff67B"

const arbitrumTVL = async (timestamp, block, chainBlocks) => {
    let balances = {};
    
    balances['weth'] = await balanceOf(WETH, VAULT, chainBlocks);
    balances['wrapped-bitcoin'] = await balanceOf(WBTC, VAULT, chainBlocks);
    balances['usd-coin'] = await balanceOf(USDC, VAULT, chainBlocks);
    balances['tether'] = await balanceOf(USDT, VAULT, chainBlocks);
    balances['chainlink'] = await balanceOf(LINK, VAULT, chainBlocks);
    balances['uniswap'] = await balanceOf(UNI, VAULT, chainBlocks);
    balances['magic-internet-money'] = await balanceOf(MIM, VAULT, chainBlocks);
    balances['frax'] = await balanceOf(FRAX, VAULT, chainBlocks);
    balances['dai'] = await balanceOf(DAI, VAULT, chainBlocks);
    //balances['aave'] = await balanceOf(AAVE, VAULT, chainBlocks); Arbitrum address TBD
    balances['spell-token'] = await balanceOf(SPELL, VAULT, chainBlocks);
    balances['sushi'] = await balanceOf(SUSHI, VAULT, chainBlocks);
    
    return balances;
}

const bscTVL = async (timestamp, block, chainBlocks) =>{
    const balances = {}
    const allTokens = (await axios.get(apiEndpoint)).data
    const tokenBalances = await sdk.api.abi.multiCall({
        calls: allTokens.map(token=>({
            target: token.id,
            params: [pool]
        })),
        abi: 'erc20:balanceOf',
        chain: 'bsc',
        block: chainBlocks.bsc
    })
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, d=>`bsc:${d}`)
    return balances
}

async function balanceOf(pTarget, pParam, pChainBlocks) {
    let decimals = await sdk.api.abi.call({
        target: pTarget,
        abi: 'erc20:decimals',
        block: pChainBlocks.arbitrum,
        chain: 'arbitrum'
    });
    let result = await sdk.api.abi.call({
      target: pTarget,
      params: pParam,
      abi: 'erc20:balanceOf',
      block: pChainBlocks.arbitrum,
      chain: 'arbitrum'
    });
    return result.output*Math.pow(10, -decimals.output);
}

module.exports = {
  arbitrum: {
    stakign: staking(STAKING, GMX, "arbitrum", "gmx", 18),
    tvl: arbitrumTVL,
  },
  bsc: {
    tvl: bscTVL,
  },
};