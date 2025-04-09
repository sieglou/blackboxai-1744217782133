"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureStorage = void 0;
const getRandomBytes = (size) => {
    const array = new Uint8Array(size);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
    }
    else {
        // Fallback for non-browser environments
        for (let i = 0; i < size; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    return array;
};
class SecureStorage {
    static instances = new Map();
    data = null;
    constructor() { }
    static getInstance(key) {
        if (!this.instances.has(key)) {
            this.instances.set(key, new SecureStorage());
        }
        return this.instances.get(key);
    }
    store(data) {
        this.wipe();
        this.data = Buffer.from(data, 'utf8');
    }
    retrieve() {
        return this.data?.toString('utf8') || null;
    }
    wipe() {
        if (this.data) {
            // Securely overwrite memory with random data
            Buffer.from(getRandomBytes(this.data.length)).copy(this.data);
            this.data = null;
        }
    }
}
exports.SecureStorage = SecureStorage;
