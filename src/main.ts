import * as Router from "./routes"
import * as Controller from "./controller";

import { OWNER, RANDOM_NUM } from "./constant";
import { decrypt } from "./utils";

//========================================================================//
//=================== USER CREATE TOKEN INFO(CUSTOM) =====================//
//========================================================================//

const imgUrl = "https://static.four.meme/market/425b1083-eaba-40a3-b50a-498952c804d510617906659536068632.png";
const description = "It";
const tag = "AI";
const tokenName = "random";
const tokenSymbol = "CAKE";
const nativeSymbol = "BNB";
const tradingFee = 0.01;
const presale = 0;

//=======================================================================//
//=======================================================================//
//=======================================================================//

const owner = decrypt(OWNER, RANDOM_NUM);

const main = async () => {
  try {
    const cookie = await Controller.login(owner);
    console.log('cookie :>> ', cookie);

    if (!cookie) return;

    const { tokenId, signature, createArg } = await Router.getCreateTokenInfo(cookie, description, imgUrl, tag, tradingFee, tokenName, presale, tokenSymbol, nativeSymbol);

    if (!signature || !tokenId) return;

    const signedTxHash = await Controller.signCreateTokenTx(createArg, signature, owner);
    console.log('signedTxHash :>> ', signedTxHash,);

    if (!signedTxHash) return;

    const tokenAddress = await Router.getInfoById(tokenId, cookie);
    console.log('tokenAddress :>> ', `https://four.meme/token/${tokenAddress}`);
  } catch (error: any) {
    console.log({ error })
    throw new Error(error)
  }
}

main()