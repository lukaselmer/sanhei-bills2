import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from '../bill';
import { Article } from './../article';
import { BillArticle } from './../bill-article';
import { IBillingDatabase } from './billing-database';
import { DataStoreStatus } from './data-store-status';
import { IDBStoreService } from './idb-store.service';

@Injectable()
export class DataStoreService {
  private storeStream = new BehaviorSubject<IBillingDatabase>({
    articles: {}, billArticles: {}, bills: {}
  });

  status: DataStoreStatus = 'idle';

  constructor(private db: AngularFireDatabase, private idbStoreService: IDBStoreService) { }

  store(): IBillingDatabase {
    return this.storeStream.getValue();
  }

  getBillsStream(): Observable<Bill[]> {
    return this.storeStream.asObservable().map(stream =>
      this.toArray(stream.bills).sort((a, b) =>
        b.id.toString().localeCompare(a.id.toString())
      )
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

  private toArray<T extends { id: string }>(items: { [index: string]: T }): T[] {
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
        updatedRecords.forEach(record => {
          if (record.id) store[table][record.id] = record;
        });
        updatedRecords.forEach(record => {
          if (record.deletedAt) delete store[table][record.id];
        });
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
    this.removeDeleted(data);
    this.storeStream.next(data);
  }

  private removeDeleted(data: IBillingDatabase) {
    this.removeDeletedEntries(data.articles);
    this.removeDeletedEntries(data.bills);
    this.removeDeletedEntries(data.billArticles);
  }

  private removeDeletedEntries<T extends Article | Bill | BillArticle>(entries: { [index: string]: T }) {
    Object.keys(entries).forEach(id => {
      if (entries[id].deletedAt) delete (entries[id]);
    });
  }

  async createBill(bill: Bill): Promise<Bill> {
    this.setCreated(bill);
    const newRef = this.db.list(`billing/bills`).push(bill);
    await newRef;
    bill.id = newRef.key as string;
    await this.db.list(`billing/bills`).update(newRef, bill);
    return await this.db.object(`billing/bills/${newRef.key}`).first().toPromise<Bill>();
  }

  async updateBill(bill: Bill) {
    this.setUpdated(bill);
    await this.db.object(`billing/bills/${bill.id}`).set(bill);
  }

  async deleteBill(bill: Bill) {
    this.setDeleted(bill);
    await this.db.object(`billing/bills/${bill.id}`).set(bill);
  }

  async createArticle(article: Article): Promise<Article> {
    this.setCreated(article);
    const newRef = this.db.list(`billing/articles`).push(article);
    await newRef;
    article.id = newRef.key as string;
    await this.db.list(`billing/articles`).update(newRef, article);
    return await this.db.object(`billing/articles/${newRef.key}`).first().toPromise<Article>();
  }

  async updateArticle(article: Article) {
    this.setUpdated(article);
    await this.db.object(`billing/articles/${article.id}`).set(article);
  }

  async deleteArticle(article: Article) {
    this.setDeleted(article);
    await this.db.object(`billing/articles/${article.id}`).set(article);
  }

  async createBillArticle(billArticle: BillArticle): Promise<BillArticle> {
    this.setCreated(billArticle);
    const newRef = this.db.list(`billing/billArticles`).push(billArticle);
    await newRef;
    billArticle.id = newRef.key as string;
    await this.db.list(`billing/billArticles`).update(newRef, billArticle);
    return await this.db.object(`billing/billArticles/${newRef.key}`).first().toPromise<BillArticle>();
  }

  async updateBillArticle(billArticle: BillArticle) {
    this.setUpdated(billArticle);
    await this.db.object(`billing/billArticles/${billArticle.id}`).set(billArticle);
  }

  async deleteBillArticle(billArticle: BillArticle) {
    this.setDeleted(billArticle);
    await this.db.object(`billing/billArticles/${billArticle.id}`).set(billArticle);
  }

  private setCreated(dbObject: Article | BillArticle | Bill) {
    dbObject.createdAt = firebase.database.ServerValue.TIMESTAMP as number;
    this.setUpdated(dbObject);
  }

  private setDeleted(dbObject: Article | BillArticle | Bill) {
    dbObject.deletedAt = firebase.database.ServerValue.TIMESTAMP as number;
    this.setUpdated(dbObject);
  }

  private setUpdated(dbObject: Article | BillArticle | Bill) {
    dbObject.updatedAt = firebase.database.ServerValue.TIMESTAMP as number;
  }
}
