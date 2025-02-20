import { ContractAbi, Transaction } from "web3";
import { chainId, RPC_ENDPOINT, w3 } from "./constant";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

function getKeyFromString(keyString: string) {
    return crypto.createHash("sha256").update(keyString).digest();
}

// Encryption function
export const encrypt = function (text: string, keyString: string) {
    const key = getKeyFromString(keyString);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
};

// Decryption function
export const decrypt = function (encryptedText: string, keyString: string) {
    const key = getKeyFromString(keyString);
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};

export const signMsg = async (msg: string, owner: string) => {
    try {
        const signedMsg = w3.eth.accounts.sign(msg, owner);

        return signedMsg.signature;
    } catch (error) {
        console.error(error)
        // throw new Error(error);
    }
}

export const signTx = async (tx: Transaction, owner: string) => {
    try {
        const signedTx = await w3.eth.accounts.signTransaction(tx, owner);

        const data = {
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [w3.utils.toHex(signedTx.rawTransaction)],
            id: chainId,
        };

        const response = await axios.post(RPC_ENDPOINT, data);

        if (response.status !== 200) {
            return false;
        }

        const txHash = response.data.result;

        console.log('approve txHash :>> ', response.data.result);

        return txHash;
    } catch (error) {
        console.error(error);
    }
}

export function get_TOKENMANAGER_V2_abi(): ContractAbi {
    const data = fs.readFileSync('src/abi/TokenManager_v2.json', 'utf8');
    return JSON.parse(data);
}

export async function getBalance(wallet_addr: string) {
    const balanceWei = await w3.eth.getBalance(w3.utils.toChecksumAddress(wallet_addr));

    console.log({
        bsc: parseFloat(w3.utils.fromWei(balanceWei, 'ether')),
        wei: balanceWei
    });

    return {
        bsc: parseFloat(w3.utils.fromWei(balanceWei, 'ether')),
        wei: balanceWei
    }
}