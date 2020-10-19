import { Injectable } from '@angular/core'

// temporary hack until firebase caches the data offline by default
// see https://github.com/firebase/firebase-js-sdk/issues/17
@Injectable()
export class IDBStoreService {
  loadFromIDB<T>(table: string): Promise<{ [index: string]: T }> {
    return new Promise<{
      [index: string]: T
    }>((resolve, reject) => {
      const dbRequest = this.openDB(reject)

      dbRequest.onsuccess = (event: any) => {
        try {
          const db: IDBDatabase = (event.target as IDBRequest).result
          const objectStore = db.transaction(table).objectStore(table)

          objectStore.openCursor().onsuccess = (cursorEvent) => {
            const cursor: IDBCursorWithValue = (cursorEvent.target as any).result
            if (cursor) {
              resolve(cursor.value)
              cursor.continue()
            } else {
              resolve({})
            }
          }
        } catch (ex) {
          reject(ex)
          return
        }
      }
    })
  }

  storeInIDB<T>(table: string, elements: { [index: string]: T }): Promise<void> {
    // this may be a bad idea since it is IO/CPU intensive
    // optimizations would be nice
    return new Promise<void>((resolve, reject) => {
      const dbRequest = this.openDB(reject)

      dbRequest.onsuccess = (event: any) => {
        try {
          const db: IDBDatabase = (event.target as IDBRequest).result
          const objectStore = db.transaction(table, 'readwrite').objectStore(table)

          const request = objectStore.clear()
          request.onerror = (ex) => reject(ex)
          request.onsuccess = () => {
            objectStore.add(elements).onerror = (ex) => reject(ex)
          }
        } catch (ex) {
          reject(ex)
          return
        }
        resolve()
      }
    })
  }

  private openDB(reject: (reason?: any) => void): IDBOpenDBRequest {
    const dbRequest = indexedDB.open('sanheiBilling', 4)
    dbRequest.onerror = (event) => {
      indexedDB.deleteDatabase('sanheiBilling').onsuccess = () => window.location.reload()
      reject(event)
    }
    dbRequest.onupgradeneeded = (event) => {
      const db: IDBDatabase = (event.target as any).result
      if (event.oldVersion) {
        indexedDB.deleteDatabase('sanheiBilling').onsuccess = () => window.location.reload()
      } else {
        db.createObjectStore('bills', {
          autoIncrement: true,
        })
      }
    }
    return dbRequest
  }
}
