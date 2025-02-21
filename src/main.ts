import * as Router from "./routes";
import * as Controller from "./controller";

import { OWNER, RANDOM_NUM, RPC_ENDPOINT, WBNB_ADDRESS } from "./constant";
import { decrypt } from "./utils";
import { ethers } from "ethers";
import { swapBuyToken, swapSellToken } from "./controller/routerswapv2";

// Initialize provider and owner
export const owner = decrypt(OWNER, RANDOM_NUM);
export const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);

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
  tokenAddr: "0x2dce707c47fd9c0f1833a281f45e3e41ace2725b",
  slippage: 0.2,
  walletAddr: "0x3b356Eb7627814C5C9683bb089584df341F5A90e",
  amountInWEI: 0.5,
  amountInToken: 100000,
};

//========================================================================//
//====================== HELPER FUNCTIONS ===============================//
//========================================================================//

/**
 * Handles errors in async functions to reduce try-catch repetition.
 */
const handleError = async (fn: Function, fnName: string) => {
  try {
    return await fn();
  } catch (error: any) {
    console.error(`[Error] ${fnName}:`, error);
    throw new Error(error);
  }
};

/**
 * Launches a new token.
 */
const tokenLaunch = async () => {
  return handleError(async () => {
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

    const tokenAddress = await Router.getInfoById(tokenId, cookie);
    console.log("Token Launched:", `https://four.meme/token/${tokenAddress}`);
  }, "tokenLaunch");
};

/**
 * Buys a token on PancakeSwap.
 */
const tokenBuyPancakeSwap = async () => {
  return handleError(async () => {
    const buyTx = await swapBuyToken(
      SWAP_CONFIG.slippage,
      SWAP_CONFIG.tokenAddr,
      SWAP_CONFIG.walletAddr,
      SWAP_CONFIG.amountInWEI
    );

    console.log("Buy Transaction:", buyTx);
  }, "tokenBuyPancakeSwap");
};

/**
 * Sells a token on PancakeSwap.
 */
const tokenSellPancakeSwap = async () => {
  return handleError(async () => {
    const sellTx = await swapSellToken(
      SWAP_CONFIG.slippage,
      SWAP_CONFIG.tokenAddr,
      SWAP_CONFIG.walletAddr,
      SWAP_CONFIG.amountInToken
    );

    console.log("Sell Transaction:", sellTx);
  }, "tokenSellPancakeSwap");
};

//========================================================================//
//========================= EXECUTE FUNCTIONS ============================//
//========================================================================//

// Uncomment to run
// tokenLaunch();
// tokenBuyPancakeSwap();
// tokenSellPancakeSwap();
