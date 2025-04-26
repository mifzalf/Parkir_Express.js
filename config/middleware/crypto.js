const CryptoJS = require('crypto-js');

const SECRET_KEY = CryptoJS.enc.Utf8.parse(process.env.SECRET_KEY);
const IV = CryptoJS.enc.Utf8.parse(process.env.IV);

function encryptData(data) {
    try {
        if (!data) throw new Error("No data provided for encryption.");

        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY, {
            iv: IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }).toString();

        return ciphertext;
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
}

function decryptData(encryptedData) {
    try {
        if (!encryptedData) throw new Error("No data provided for decryption.");

        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
            iv: IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) throw new Error("Failed to decode UTF-8.");

        return JSON.parse(decryptedText);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

module.exports = { encryptData, decryptData };
