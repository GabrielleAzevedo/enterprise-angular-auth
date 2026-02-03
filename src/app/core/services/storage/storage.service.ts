import { Injectable, Inject, InjectionToken } from '@angular/core';

export const STORAGE_TOKEN = new InjectionToken<Storage>('StorageToken', {
  providedIn: 'root',
  factory: () => (typeof window !== 'undefined' ? window.localStorage : ({} as Storage)),
});

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(@Inject(STORAGE_TOKEN) private storage: Storage) {}

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
