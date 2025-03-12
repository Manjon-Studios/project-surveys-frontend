import { inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage = inject(LOCAL_STORAGE);

  setItem(key: string, value: any): void {
    this._storage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const storedValue = this._storage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : null;
  }

  removeItem(key: string): void {
    this._storage.removeItem(key);
  }
}
