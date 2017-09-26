import { Injectable } from '@angular/core';

// temporary hack until firebase caches the data offline by default
// see https://github.com/firebase/firebase-js-sdk/issues/17
@Injectable()
export class IDBStoreService {
  loadFromIDB<T>(table: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const dbRequest = this.openDB(reject);

      dbRequest.onsuccess = (event: any) => {
        try {
          const db: IDBDatabase = (event.target as IDBRequest).result;
          const objectStore = db.transaction(table).objectStore(table);
          const elements: T[] = [];

          objectStore.openCursor().onsuccess = cursorEvent => {
            const cursor: IDBCursorWithValue = (cursorEvent.target as any).result;
            if (cursor) {
              elements.push(cursor.value);
              cursor.continue();
            } else {
              resolve(elements);
            }
          };
        } catch (ex) {
          reject(ex);
          return;
        }
      };
    });
  }

  storeInIDB<T>(table: string, elements: T[]): Promise<void> {
    // this may be a bad idea since it is IO/CPU intensive
    // optimizations would be nice
    return new Promise<void>((resolve, reject) => {
      const dbRequest = this.openDB(reject);

      dbRequest.onsuccess = (event: any) => {
        try {
          const db: IDBDatabase = (event.target as IDBRequest).result;
          const objectStore = db.transaction(table, 'readwrite').objectStore(table);

          const request = objectStore.clear();
          request.onerror = ex => reject(ex);
          request.onsuccess = () => {
            elements.forEach(element => {
              objectStore.add(element).onerror = ex => reject(ex);
            });
          };
        } catch (ex) {
          reject(ex);
          return;
        }
        resolve();
      };
    });
  }

  private openDB(reject: (reason?: any) => void): IDBOpenDBRequest {
    const dbRequest = indexedDB.open('billing', 1);
    dbRequest.onerror = event => reject(event);
    dbRequest.onupgradeneeded = event => {
      const db: IDBDatabase = (event.target as any).result;
      db.createObjectStore('bills', { autoIncrement: true });
      db.createObjectStore('articles', { autoIncrement: true });
      db.createObjectStore('billArticles', { autoIncrement: true });
    };
    return dbRequest;
  }
}
