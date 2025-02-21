import * as Router from "./routes";
import * as Controller from "./controller";

import { OWNER, RANDOM_NUM, RPC_ENDPOINT, WBNB_ADDRESS } from "./constant";
import { decrypt, getTokenInfo } from "./utils";
import { ethers } from "ethers";
import { swapBuyTokenV2, swapSellTokenV2 } from "./controller/routerswapv2";
import { simpleSwap } from "./controller/routerswapv3";

// Initialize provider, signer, and owner
export const owner = decrypt(OWNER, RANDOM_NUM);
export const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
export const signer = new ethers.Wallet(owner, provider);

//========================================================================//
//========================= CONFIGURATION ===============================//
//========================================================================//

const TOKEN_CONFIG = {
  imgUrl: "https://static.four.meme/market/425b1083-eaba-40a3-b50a-498952c804d510617906659536068632.png",
  description: "It",
  tag: "AI",
  name: "random",
  symbol: "CAKE",
  nativeSymbol: "BNB",
  tradingFee: 0.01,
  presale: 0,
};

const SWAP_CONFIG = {
  tokenAddr: "0x36F5675029E129B5fCaBb29eC750ed268520AcF7",
  slippage: 0.2,
  walletAddr: "0x3b356Eb7627814C5C9683bb089584df341F5A90e",
  amountInWEI: 0.5,
  amountInToken: 100000000,
};

//========================================================================//
//======================== HELPER FUNCTIONS ==============================//
//========================================================================//

/**
 * Handles token buy/sell operations based on pool type.
 * @param {boolean} isBuy - Determines if it's a buy or sell transaction.
 */
const executeSwap = async (isBuy: boolean) => {
  try {
    const { tokenAddr, walletAddr, slippage, amountInWEI, amountInToken } = SWAP_CONFIG;
    const poolTypes = await getTokenInfo(tokenAddr);

    if (!poolTypes || poolTypes.length === 0) {
      console.log(`No liquidity pool found for token: ${tokenAddr}`);
      return;
    }

    let tx;
    if (poolTypes[0] === "v2") {
      tx = isBuy
        ? await swapBuyTokenV2(slippage, tokenAddr, walletAddr, amountInWEI)
        : await swapSellTokenV2(slippage, tokenAddr, walletAddr, amountInToken);
    } else {
      tx = await simpleSwap(
        slippage,
        amountInToken.toString(),
        isBuy ? WBNB_ADDRESS : tokenAddr,
        isBuy ? tokenAddr : WBNB_ADDRESS
      );
    }

    console.log(`${isBuy ? "Buy" : "Sell"} Transaction Successful:`, tx);
  } catch (error) {
    console.error(`[Error] ${isBuy ? "tokenBuyPancakeSwap" : "tokenSellPancakeSwap"}:`, error);
  }
};

/**
 * Launches a new token.
 */
const tokenLaunch = async () => {
  try {
    const cookie = await Controller.login(owner);
    if (!cookie) throw new Error("Login failed. Cookie not received.");

    const { tokenId, signature, createArg } = await Router.getCreateTokenInfo(
      cookie,
      TOKEN_CONFIG.description,
      TOKEN_CONFIG.imgUrl,
      TOKEN_CONFIG.tag,
      TOKEN_CONFIG.tradingFee,
      TOKEN_CONFIG.name,
      TOKEN_CONFIG.presale,
      TOKEN_CONFIG.symbol,
      TOKEN_CONFIG.nativeSymbol
    );

    if (!signature || !tokenId) throw new Error("Token creation signature or ID missing.");

    const signedTxHash = await Controller.signCreateTokenTx(createArg, signature, owner);
    if (!signedTxHash) throw new Error("Transaction signing failed.");

    // const tokenAddress = await Router.getInfoById(tokenId, cookie);
    // console.log("Token Launched:", `https://four.meme/token/${tokenAddress}`);
  } catch (error) {
    console.error("[Error] tokenLaunch:", error);
  }
};

//========================================================================//
//========================= EXECUTE FUNCTIONS ============================//
//========================================================================//

const test = async () => {
  const res = await getTokenInfo(SWAP_CONFIG.tokenAddr);
  console.log("Token Info:", res);
};


// test();

// Uncomment to run
// tokenLaunch();
executeSwap(true);  // Buy Token
// executeSwap(false); // Sell Token