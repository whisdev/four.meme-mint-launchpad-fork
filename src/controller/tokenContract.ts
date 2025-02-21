import { ethers } from "ethers";

import { get_TOKEN_abi } from "../utils";
import { PANCAKE_V2_SWAPROUTER_ADDRESS, RPC_ENDPOINT } from "../constant";
import { owner } from "../main";

const tokenABI = get_TOKEN_abi();
const signer = new ethers.Wallet(owner, new ethers.JsonRpcProvider(RPC_ENDPOINT));

export const getDecimal = async (tokenAddr: string) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddr, tokenABI, signer);
        const decimal = await tokenContract.decimal();

        return decimal;
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}

export const getAllowance = async (tokenAddr: string, walletAddr: string) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddr, tokenABI, signer);
        const allowance = await tokenContract.allowance(walletAddr, PANCAKE_V2_SWAPROUTER_ADDRESS);

        return allowance;
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}

export const tokenApprove = async (tokenAddr: string) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddr, tokenABI, signer);
        const decimal = await tokenContract.decimal();

        const approveAmount = 1000000000000000000000000;
        const approveTx = await tokenContract.approve(PANCAKE_V2_SWAPROUTER_ADDRESS, approveAmount * 10 ** Number(decimal));

        await approveTx.wait();

        return approveTx.hash;
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}