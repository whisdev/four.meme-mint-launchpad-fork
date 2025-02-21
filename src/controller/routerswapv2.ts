import { ethers } from "ethers";

import {
    PANCAKE_V2_FACTORY_ADDRESS,
    PANCAKE_V2_SWAPROUTER_ADDRESS,
    RPC_ENDPOINT,
    w3,
    WBNB_ADDRESS
} from "../constant";
import { getAllowance, getDecimal, tokenApprove } from "./tokenContract"
import { get_PANCAKE_V2_FACTORY_abi, get_PANCAKE_V2_ROUTER_abi, get_TOKEN_abi } from "../utils";
import { owner, signer } from "../main";

const factoryV2ABI = get_PANCAKE_V2_FACTORY_abi();
const routerV2ABI = get_PANCAKE_V2_ROUTER_abi();

const factoryV2CONTRACT = new ethers.Contract(PANCAKE_V2_FACTORY_ADDRESS, factoryV2ABI, signer);
const routerV2CONTRACT = new ethers.Contract(PANCAKE_V2_SWAPROUTER_ADDRESS, routerV2ABI, signer);

export const getExpectedAmountsOut = async (amountIn: number, tokenA: string, tokenB: string, slippage: number) => {
    try {
        const decimal = await getDecimal(tokenB);

        const amountInWEI = w3.utils.toWei(amountIn.toString(), 'ether');
        const expectedAmountOut = await routerV2CONTRACT.getAmountsOut.staticCall(amountInWEI, [tokenA, tokenB]);

        const expectedAmountOutString = expectedAmountOut[expectedAmountOut.length - 1].toString();
        const slippageAdjustedAmountOut = (BigInt(expectedAmountOutString) * BigInt((1 - slippage) * 1000000000)) / BigInt(1000000000);
        const amountOutMin = Math.floor(parseFloat(w3.utils.toWei(slippageAdjustedAmountOut.toString(), 'wei')) / 10 ** Number(decimal)) * 10 ** Number(decimal);

        return amountOutMin;
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}

export const swapBuyTokenV2 = async (slippage: number, tokenAddr: string, walletAddr: string, amountInWEI: number) => {
    try {
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        const amountOutMin = await getExpectedAmountsOut(amountInWEI, WBNB_ADDRESS, tokenAddr, slippage);

        const tx = await routerV2CONTRACT.swapExactETHForTokens(
            amountOutMin,
            [
                w3.utils.toChecksumAddress(WBNB_ADDRESS),
                w3.utils.toChecksumAddress(tokenAddr),
            ],
            w3.utils.toChecksumAddress(walletAddr),
            deadline, {
            value: amountInWEI
        }
        )
        await tx.wait();

        return tx.hash;
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}

export const swapSellTokenV2 = async (slippage: number, tokenAddr: string, walletAddr: string, amountIn: number) => {
    try {
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        const amountOutMin = await getExpectedAmountsOut(amountIn, tokenAddr, WBNB_ADDRESS, slippage);
        const allowance = await getAllowance(tokenAddr, walletAddr);

        if (Number(allowance) < amountIn) {
            const approvedTxHash = await tokenApprove(tokenAddr);

            if (!approvedTxHash) return null;
        }

        const swapTx = await routerV2CONTRACT.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            0,
            [
                w3.utils.toChecksumAddress(tokenAddr),
                w3.utils.toChecksumAddress(WBNB_ADDRESS),
            ],
            walletAddr,
            deadline)

        await swapTx.wait();

        return swapTx.hash;
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}