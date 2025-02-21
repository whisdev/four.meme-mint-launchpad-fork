import { ethers } from "ethers";

import {
    PANCAKE_V3_FACTORY_ADDRESS,
    PANCAKE_V3_SWAPROUTER_ADDRESS,
    RPC_ENDPOINT,
    w3,
    WBNB_ADDRESS
} from "../constant";
import { getAllowance, getDecimal, tokenApprove } from "./tokenContract"
import { get_PANCAKE_V3_FACTORY_abi, get_PANCAKE_V3_ROUTER_abi, get_TOKEN_abi, getTokenInfo } from "../utils";
import { owner, signer } from "../main";


const factoryV3ABI = get_PANCAKE_V3_FACTORY_abi();
const routerV3ABI = get_PANCAKE_V3_ROUTER_abi();

const factoryV3CONTRACT = new ethers.Contract(PANCAKE_V3_FACTORY_ADDRESS, factoryV3ABI, signer);
const routerV3CONTRACT = new ethers.Contract(PANCAKE_V3_SWAPROUTER_ADDRESS, routerV3ABI, signer);

export const swapSellTokenV3 = async () => {
    try {
    } catch (error: any) {
        console.log('error :>> ', error);
        throw new Error(error)
    }
}