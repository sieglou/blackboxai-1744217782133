const getRandomBytes = (size: number) => {
  const array = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for non-browser environments
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return array;
};

export class SecureStorage {
  private static instances: Map<string, SecureStorage> = new Map();
  private data: Buffer | null = null;

  private constructor() {}

  public static getInstance(key: string): SecureStorage {
    if (!this.instances.has(key)) {
      this.instances.set(key, new SecureStorage());
    }
    return this.instances.get(key)!;
  }

  public store(data: string): void {
    this.wipe();
    this.data = Buffer.from(data, 'utf8');
  }

  public retrieve(): string | null {
    return this.data?.toString('utf8') || null;
  }

  public wipe(): void {
    if (this.data) {
      // Securely overwrite memory with random data
      Buffer.from(getRandomBytes(this.data.length)).copy(this.data);
      this.data = null;
    }
  }
}
