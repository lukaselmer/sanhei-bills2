import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { Bill } from '../bill';
import { DataStoreStatus } from './data-store-status';
import { IDBStoreService } from './idb-store.service';

@Injectable()
export class DataStoreService {
  private billsCache = new BehaviorSubject<Bill[]>([]);

  status: DataStoreStatus = 'loading';

  constructor(private db: AngularFireDatabase, private idbStoreService: IDBStoreService) { }

  getBillsStream(): Observable<Bill[]> {
    return this.billsCache.asObservable();
  }

  async loadData() {
    await this.loadCachedBillsFromIDB();
    await this.loadFirstBillsFromFirebase();
    this.keepIDBBillsUpToDate();
    this.loadAllBillsFromFirebase();
  }

  private async loadCachedBillsFromIDB(): Promise<void> {
    try {
      const bills = await this.idbStoreService.loadFromIDB<Bill>('bills');
      this.status = 'loadedFromIDB';
      this.nextBills(bills);
    } catch (ex) {
      console.error(ex);
    }
  }

  private keepIDBBillsUpToDate() {
    this.billsCache.subscribe(bills => this.idbStoreService.storeInIDB<Bill>('bills', bills));
  }

  private async loadFirstBillsFromFirebase() {
    // load the first few records to display them asap
    if (this.billsCache.getValue().length === 0) {
      const firstReversedBills = await this.forIndex().first().toPromise();
      this.status = 'shortListLoaded';
      this.nextBills(firstReversedBills.slice().reverse());
    }
  }

  private forIndex(): Observable<Bill[]> {
    return this.db.list('billing/bills', {
      query: { limitToLast: 1, orderByChild: 'id' }
    });
  }

  private loadAllBillsFromFirebase() {
    // load the rest of the bills and listen for updates
    this.db.list('billing/bills', {
      // TODO: fix firebase performance issue
      query: { orderByChild: 'id', limitToLast: 100 }
    }).subscribe(reversedBills => {
      this.status = 'loaded';
      this.nextBills(reversedBills.slice().reverse());
    });
  }

  private nextBills(bills: Bill[]) {
    this.billsCache.next(bills);
  }

  updateBill(bill: Bill) {
    this.db.object(`billing/bills/${bill.id}`).set(bill);
  }
}
