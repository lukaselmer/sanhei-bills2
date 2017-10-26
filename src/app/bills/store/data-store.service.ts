import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from '../bill';
import { EditedBill } from './../edited-bill';
import { NewBill } from './../new-bill';
import { IBillingDatabase } from './billing-database';
import { DataStoreStatus } from './data-store-status';
import { IDBStoreService } from './idb-store.service';

@Injectable()
export class DataStoreService {
  private storeStream = new BehaviorSubject<IBillingDatabase>({ bills: {} });

  status: DataStoreStatus = 'idle';

  constructor(private db: AngularFireDatabase, private idbStoreService: IDBStoreService) {}

  store(): IBillingDatabase {
    return this.storeStream.getValue();
  }

  getBills(): Bill[] {
    return this.convertBills(this.store());
  }

  getBillsStream(): Observable<Bill[]> {
    return this.storeStream.asObservable().map(store => this.convertBills(store));
  }

  private convertBills(store: IBillingDatabase) {
    return this.toArray(store.bills).sort((a, b) => b.createdAt - a.createdAt);
  }

  async loadData(): Promise<void> {
    if (this.status !== 'idle') {
      return Promise.resolve(undefined);
    }
    this.status = 'loading';
    await this.loadCachedDataFromIDB();
    await this.initializeFirebaseSync();
  }
  private async loadCachedDataFromIDB(): Promise<void> {
    const bills = await this.idbStoreService.loadFromIDB<Bill>('bills');
    this.status = 'loadedFromIDB';
    if (Object.keys(bills).length > 0) {
      this.status = 'loaded';
    }
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

    this.db
      .list('billing/bills', query => {
        return query.orderByChild('updatedAt').startAt(this.nextSyncTimestamp());
      })
      .valueChanges()
      .subscribe(async (bills: Bill[]) => {
        if (bills.length === 0) {
          return;
        }
        const store = this.store();
        bills.forEach(bill => {
          if (!bill.articles) {
            bill.articles = [];
          }
          if (bill.id) {
            store.bills[bill.id] = bill;
          }
          if (bill.deletedAt) {
            delete store.bills[bill.id];
          }
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
    const data: IBillingDatabase = (await this.db
      .object('billing')
      .valueChanges()
      .first()
      .toPromise()) as IBillingDatabase;
    this.status = 'loaded';
    this.correctArticles(data);
    this.removeDeleted(data);
    this.storeStream.next(data);
  }

  private correctArticles(data: IBillingDatabase) {
    Object.keys(data.bills).forEach(id => {
      if (!data.bills[id].articles) {
        data.bills[id].articles = [];
      }
    });
  }

  private removeDeleted(data: IBillingDatabase) {
    Object.keys(data.bills).forEach(id => {
      if (data.bills[id].deletedAt) {
        delete data.bills[id];
      }
    });
  }

  async createBill(newBill: NewBill): Promise<void> {
    this.setCreated(newBill);
    return this.db.list(`billing/bills`).push(newBill);
  }

  async updateBill(bill: EditedBill | Bill) {
    this.setUpdated(bill);
    const billAttributes = {
      ...bill
    } as any;
    Object.keys(billAttributes).forEach(k => {
      if (billAttributes[k] === undefined) {
        delete billAttributes[k];
      }
    });
    await this.db.object(`billing/bills/${bill.id}`).set(billAttributes);
  }

  async deleteBill(bill: Bill) {
    this.setDeleted(bill);
    await this.db.object(`billing/bills/${bill.id}`).set(bill);
  }

  private setCreated(newBill: NewBill) {
    newBill.createdAt = firebase.database.ServerValue.TIMESTAMP;
    this.setUpdated(newBill);
  }

  private setDeleted(dbObject: Bill) {
    dbObject.deletedAt = firebase.database.ServerValue.TIMESTAMP as number;
    this.setUpdated(dbObject);
  }

  private setUpdated(bill: Bill | NewBill | EditedBill) {
    bill.updatedAt = firebase.database.ServerValue.TIMESTAMP;
  }
}
