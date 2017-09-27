import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from '../bill';
import { BillArticle } from '../bill-article';
import { Article } from './../article';
import { IBillingDatabase } from './billing-database';
import { DataStoreStatus } from './data-store-status';
import { IDBStoreService } from './idb-store.service';

@Injectable()
export class DataStoreService {
  private storeStream = new BehaviorSubject<IBillingDatabase>({
    articles: {}, billArticles: {}, bills: {}
  });

  status: DataStoreStatus = 'idle';

  constructor(private db: AngularFireDatabase, private idbStoreService: IDBStoreService) {
    this.db.object('.info/connected').subscribe(val => {
      console.log(val);
    });
  }

  private store(): IBillingDatabase {
    return this.storeStream.getValue();
  }

  getBillsStream(): Observable<Bill[]> {
    return this.storeStream.asObservable().map(stream =>
      this.toArray(stream.bills).sort((a, b) => {
        if (typeof a.id === 'number' && typeof b.id === 'number') return b.id - a.id;
        return b.id.toString().localeCompare(a.id.toString());
      })
    );
  }

  async loadData(): Promise<void> {
    if (this.status !== 'idle') return Promise.resolve(undefined);
    this.status = 'loading';
    await this.loadCachedDataFromIDB();
    await this.initializeFirebaseSync();
    // debug code:
    // this.db.object('billing/bills/6381/updatedAt').set(firebase.database.ServerValue.TIMESTAMP);
    // this.db.object('billing/articles/1/updatedAt').set(firebase.database.ServerValue.TIMESTAMP);
    // this.db.object('billing/billArticles/1/updatedAt').set(firebase.database.ServerValue.TIMESTAMP);
  }
  private async loadCachedDataFromIDB(): Promise<void> {
    const [articles, billArticles, bills] = await Promise.all([
      this.idbStoreService.loadFromIDB<Article>('articles'),
      this.idbStoreService.loadFromIDB<BillArticle>('billArticles'),
      this.idbStoreService.loadFromIDB<Bill>('bills')
    ]);
    this.status = 'loadedFromIDB';
    if (Object.keys(bills).length > 0) this.status = 'loaded';
    this.storeStream.next({
      articles,
      billArticles,
      bills
    });
  }

  private toArray<T extends { id: number | string }>(items: { [index: string]: T }): T[] {
    return Object.keys(items).map(key => items[key]);
  }

  private async initializeFirebaseSync() {
    if (Object.keys(this.store().articles).length === 0) {
      await this.downloadWholeDatabase();
      await Promise.all([
        this.idbStoreService.storeInIDB('articles', this.store().articles),
        this.idbStoreService.storeInIDB('billArticles', this.store().billArticles),
        this.idbStoreService.storeInIDB('bills', this.store().bills)
      ]);
    }

    ['articles', 'billArticles', 'bills'].forEach((table: 'articles' | 'billArticles' | 'bills') => {
      this.db.list(`billing/${table}`, {
        query: { orderByChild: 'updatedAt', startAt: this.nextSyncTimestamp() }
      }).subscribe(async updatedRecords => {
        if (updatedRecords.length === 0) return;
        const store = this.store();
        updatedRecords.forEach(record => store[table][record.id] = record);
        this.storeStream.next(store);
        await this.idbStoreService.storeInIDB(table, store[table] as any);
      });
    });
  }

  private nextSyncTimestamp(): number {
    const currentMaxTimestamp = Math.max(
      ...this.toArray(this.store().articles).map(el => el.updatedAt),
      ...this.toArray(this.store().billArticles).map(el => el.updatedAt),
      ...this.toArray(this.store().bills).map(el => el.updatedAt)
    );
    return currentMaxTimestamp + 1;
  }

  private get bills(): Bill[] {
    return this.toArray(this.storeStream.getValue().bills);
  }

  private async downloadWholeDatabase() {
    const data: IBillingDatabase = await this.db.object('billing').first().toPromise();
    this.status = 'loaded';
    this.storeStream.next(data);
  }

  async updateBill(bill: Bill) {
    // const store = this.store();
    // store.bills[bill.id] = bill;
    // store.bills[bill.id].updatedAt = new Date().getTime();
    // this.idbStoreService.storeInIDB('bills', store['bills'] as any).then(() =>
    // );
    this.db.object(`billing/bills/${bill.id}`).set(bill);
    // this.db.database.goOffline
  }
}
