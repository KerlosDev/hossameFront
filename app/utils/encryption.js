const crypto = require('crypto');

// Convert string key to exactly 32 bytes using SHA-256
function getKey(key) {
    return crypto.createHash('sha256').update(String(key)).digest();
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change-in-env-file';
const IV_LENGTH = 16;

function encryptArray(array) {
    if (!Array.isArray(array)) {
        return '';
    }
    try {
        // Clean the array data before stringifying
        const cleanArray = array.map(item => {
            if (typeof item === 'object') {
                return Object.fromEntries(
                    Object.entries(item).map(([key, value]) => [
                        key,
                        // Handle null, undefined, and [object Object]
                        value === null || value === undefined ? '' :
                            typeof value === 'object' ? JSON.stringify(value) : value
                    ])
                );
            }
            return item;
        });
        const jsonString = JSON.stringify(cleanArray);
        return encrypt(jsonString);
    } catch (error) {
        console.error('Encryption error:', error);
        return '';
    }
}

function decryptArray(encryptedText) {
    if (!encryptedText) return [];
    try {
        // First try to parse as JSON in case it's not encrypted
        try {
            const parsed = JSON.parse(encryptedText);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            // If parsing fails, try decryption
            const decryptedText = decrypt(encryptedText);
            if (!decryptedText) return [];

            const parsed = JSON.parse(decryptedText);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return [];
    }
}

function encrypt(text) {
    if (!text) return '';
    try {
        // Handle objects/arrays
        const stringToEncrypt = typeof text === 'object' ?
            JSON.stringify(text) : String(text);

        const key = getKey(ENCRYPTION_KEY);
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(stringToEncrypt);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return '';
    }
}

function decrypt(text) {
    if (!text) return '';
    try {
        const key = getKey(ENCRYPTION_KEY);
        const textParts = text.split(':');

        // Validate encrypted text format
        if (textParts.length !== 2) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return '';
    }
}

function encryptObject(obj) {
    if (!obj) return '';
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
}

function decryptObject(encryptedText) {
    if (!encryptedText) return null;
    try {
        const decryptedText = decrypt(encryptedText);
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

module.exports = {
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    encryptArray,
    decryptArray
};