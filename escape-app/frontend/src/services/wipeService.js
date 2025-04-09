"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WipeService = void 0;
const secureStorage_1 = require("../utils/secureStorage");
class WipeService {
    static instance;
    secureStorage = secureStorage_1.SecureStorage.getInstance('wipe');
    constructor() { }
    static getInstance() {
        if (!WipeService.instance) {
            WipeService.instance = new WipeService();
        }
        return WipeService.instance;
    }
    async secureWipe() {
        try {
            // Wipe frontend storage
            this.secureStorage.wipe();
            // Invoke backend wipe command
            await window.electron.invoke('secure-wipe');
            // Clear session
            window.location.reload();
        }
        catch (error) {
            console.error('Wipe failed:', error);
            throw new Error('Wipe operation failed');
        }
    }
}
exports.WipeService = WipeService;
