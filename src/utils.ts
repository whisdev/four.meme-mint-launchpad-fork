import { ContractAbi, Transaction } from "web3";
import { chainId, RPC_ENDPOINT, w3 } from "./constant";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { provider } from "./main";

dotenv.config();

//========================================================================//
//======================== ENCRYPTION HELPERS ============================//
//========================================================================//

const getKeyFromString = (keyString: string): Buffer =>
    crypto.createHash("sha256").update(keyString).digest();

/**
 * Encrypts a given text using AES-256-CBC.
 */
export const encrypt = (text: string, keyString: string): string => {
    const key = getKeyFromString(keyString);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

/**
 * Decrypts an encrypted text.
 */
export const decrypt = (encryptedText: string, keyString: string): string => {
    const key = getKeyFromString(keyString);
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
    return decrypted.toString("utf8");
};

//========================================================================//
//========================== WEB3 UTILITIES ==============================//
//========================================================================//

/**
 * Signs a message using the owner's private key.
 */
export const signMsg = async (msg: string, owner: string): Promise<string | null> => {
    try {
        return w3.eth.accounts.sign(msg, owner).signature;
    } catch (error) {
        console.error("[Error] signMsg:", error);
        return null;
    }
};

/**
 * Fetches wallet balance in BSC and WEI.
 */
export const getBalance = async (walletAddr: string) => {
    try {
        const balanceWei = await provider.getBalance(walletAddr);
        const balanceBSC = parseFloat(w3.utils.fromWei(balanceWei, "ether"));

        console.log(`[Balance] Wallet: ${walletAddr} | BSC: ${balanceBSC} | WEI: ${balanceWei}`);
        
        return { bsc: balanceBSC, wei: balanceWei };
    } catch (error) {
        console.error("[Error] getBalance:", error);
        return { bsc: 0, wei: "0" };
    }
};

//========================================================================//
//============================= ABI HELPERS ==============================//
//========================================================================//

/**
 * Generic function to fetch an ABI from a JSON file.
 */
const getABI = (fileName: string): ContractAbi => {
    try {
        const filePath = path.join(__dirname, "src", "abi", `${fileName}.json`);
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error(`[Error] Failed to load ABI: ${fileName}`, error);
        throw new Error(`Could not load ABI: ${fileName}`);
    }
};

// Predefined ABI fetch functions
export const get_TOKENMANAGER_V2_abi = (): ContractAbi => getABI("TokenManager_v2");
export const get_PANCAKE_V2_FACTORY_abi = (): ContractAbi => getABI("Pancake_v2_factory");
export const get_PANCAKE_V2_ROUTER_abi = (): ContractAbi => getABI("Pancake_v2_router");
export const get_PANCAKE_V3_FACTORY_abi = (): ContractAbi => getABI("Pancake_v3_factory");
export const get_PANCAKE_V3_ROUTER_abi = (): ContractAbi => getABI("Pancake_v3_router");
export const get_TOKEN_abi = (): ContractAbi => getABI("erc20");
