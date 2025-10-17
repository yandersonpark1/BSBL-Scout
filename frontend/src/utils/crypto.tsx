import CryptoJS from "crypto-js"; 

/// needs to be changed and put in env
const encrypt_key = ""; 

export function encrypt_ID(id: string): string {
    return CryptoJS.AES.encrypt(id, encrypt_key).toString(); 
}

export function decrypt_ID(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, encrypt_key); 
    return bytes.toString(CryptoJS.enc.Utf8);
}