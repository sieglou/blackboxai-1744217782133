import { SecureStorage } from '../utils/secureStorage';
declare const window: any;

export class WipeService {
  private static instance: WipeService;
  private secureStorage = SecureStorage.getInstance('wipe');

  private constructor() {}

  public static getInstance(): WipeService {
    if (!WipeService.instance) {
      WipeService.instance = new WipeService();
    }
    return WipeService.instance;
  }

  public async secureWipe(): Promise<void> {
    try {
      // Wipe frontend storage
      this.secureStorage.wipe();
      
      // Invoke backend wipe command
      await window.electron.invoke('secure-wipe');
      
      // Clear session
      window.location.reload();
    } catch (error) {
      console.error('Wipe failed:', error);
      throw new Error('Wipe operation failed');
    }
  }
}
