
/**
 * Generic Storage Repository to handle LocalStorage operations safely.
 * Implements the Repository Pattern for data persistence.
 */
export class StorageRepository<T> {
    private key: string;
    private seed: T;
  
    constructor(key: string, seed: T) {
      this.key = key;
      this.seed = seed;
    }
  
    load(): T {
      try {
        const stored = localStorage.getItem(this.key);
        if (!stored) {
          this.save(this.seed);
          return this.seed;
        }
        return JSON.parse(stored);
      } catch (e) {
        console.error(`Failed to load data for key: ${this.key}`, e);
        return this.seed;
      }
    }
  
    save(data: T): void {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
      } catch (e) {
        console.error(`Failed to save data for key: ${this.key}`, e);
      }
    }
}
