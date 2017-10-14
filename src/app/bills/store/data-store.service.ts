import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from '../bill';
import { IBillingDatabase } from './billing-database';
import { DataStoreStatus } from './data-store-status';
import { IDBStoreService } from './idb-store.service';

@Injectable()
export class DataStoreService {
  private storeStream = new BehaviorSubject<IBillingDatabase>({ bills: {} });

  status: DataStoreStatus = 'idle';

  constructor(private db: AngularFireDatabase, private idbStoreService: IDBStoreService) { }

  store(): IBillingDatabase {
    return this.storeStream.getValue();
  }

  getBillsStream(): Observable<Bill[]> {
    return this.storeStream.asObservable().map(stream =>
      this.toArray(stream.bills).sort((a, b) => b.createdAt - a.createdAt)
    );
  }

  async loadData(): Promise<void> {
    if (this.status !== 'idle') return Promise.resolve(undefined);
    this.status = 'loading';
    await this.loadCachedDataFromIDB();
    await this.initializeFirebaseSync();
  }
  private async loadCachedDataFromIDB(): Promise<void> {
    const bills = await this.idbStoreService.loadFromIDB<Bill>('bills');
    this.status = 'loadedFromIDB';
    if (Object.keys(bills).length > 0) this.status = 'loaded';
    this.storeStream.next({ bills });
  }

  private toArray<T extends { id: string }>(items: { [index: string]: T }): T[] {
    return Object.keys(items).map(key => items[key]);
  }

  private async initializeFirebaseSync() {
    if (Object.keys(this.store().bills).length === 0) {
      await this.downloadWholeDatabase();
      await this.idbStoreService.storeInIDB('bills', this.store().bills);
    }

    this.db.list('billing/bills', {
      query: { orderByChild: 'updatedAt', startAt: this.nextSyncTimestamp() }
    }).subscribe(async (bills: Bill[]) => {
      if (bills.length === 0) return;
      const store = this.store();
      bills.forEach(bill => {
        if (bill.id) store.bills[bill.id] = bill;
        if (bill.deletedAt) delete store.bills[bill.id];
      });
      this.storeStream.next(store);
      await this.idbStoreService.storeInIDB('bills', store.bills);
    });
  }

  private nextSyncTimestamp(): number {
    const currentMaxTimestamp = Math.max(
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
    Object.keys(data.bills).forEach(id => {
      if (data.bills[id].deletedAt) delete (data.bills[id]);
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
    const billAttributes = { ...bill } as any;
    Object.keys(billAttributes).forEach(k => {
      if (billAttributes[k] === undefined) delete billAttributes[k];
    });
    await this.db.object(`billing/bills/${bill.id}`).set(billAttributes);
  }

  async deleteBill(bill: Bill) {
    this.setDeleted(bill);
    await this.db.object(`billing/bills/${bill.id}`).set(bill);
  }

  private setCreated(dbObject: Bill) {
    dbObject.createdAt = firebase.database.ServerValue.TIMESTAMP as number;
    this.setUpdated(dbObject);
  }

  private setDeleted(dbObject: Bill) {
    dbObject.deletedAt = firebase.database.ServerValue.TIMESTAMP as number;
    this.setUpdated(dbObject);
  }

  private setUpdated(dbObject: Bill) {
    dbObject.updatedAt = firebase.database.ServerValue.TIMESTAMP as number;
  }
}
