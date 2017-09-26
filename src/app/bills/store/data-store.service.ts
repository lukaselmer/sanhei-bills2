import { Injectable, NgZone } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from '../bill';
import { DataStoreStatus } from './data-store-status';
import { IDBStoreService } from './idb-store.service';

@Injectable()
export class DataStoreService {
  private billsCache = new BehaviorSubject<Bill[]>([]);

  status: DataStoreStatus = 'loading';

  constructor(private db: AngularFireDatabase, private idbStoreService: IDBStoreService, private zone: NgZone) { }

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

  private async loadAllBillsFromFirebase() {
    // load the rest of the bills and listen for updates

    let t = new Date().getTime() / 1000;
    console.log(`start ${t}`);

    this.zone.runOutsideAngular(async () => {
      t = (new Date().getTime() / 1000);
      const all = await this.db.object('billing').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s object billing ${all.length}`);
      // console.log(all);
      t = (new Date().getTime() / 1000);
      const billsObject = await this.db.object('billing/bills').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s object billing/bills ${billsObject.length}`);
      // console.log(billsObject);
      t = (new Date().getTime() / 1000);
      const bills = await this.db.list('billing/bills').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s list billing/bills ${bills.length}`);
      // console.log(bills);
      t = (new Date().getTime() / 1000);
      const articlesObject = await this.db.object('billing/articles').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s object billing/articles ${articlesObject.length}`);
      // console.log(articlesObject);
      t = (new Date().getTime() / 1000);
      const articles = await this.db.list('billing/articles').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s list billing/articles ${articles.length}`);
      // console.log(articles);
      t = (new Date().getTime() / 1000);
      const articleBillsObject = await this.db.object('billing/article_bills').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s object billing/article_bills ${articleBillsObject.length}`);
      console.log(articleBillsObject);
      t = (new Date().getTime() / 1000);
      const articleBills = await this.db.list('billing/article_bills').first().toPromise();
      console.log(`${((new Date().getTime() / 1000) - t).toPrecision(4)}s list billing/article_bills ${articleBills.length}`);
      console.log(articleBills);
    });

    // this.db.list('billing/bills', {
    //   // TODO: fix firebase performance issue
    //   query: { orderByChild: 'id', limitToLast: 100000000 }
    // }).subscribe(reversedBills => {
    //   this.status = 'loaded';
    //   // this.nextBills(reversedBills.slice().reverse());
    //   this.nextBills([]);
    // });
  }

  private nextBills(bills: Bill[]) {
    this.billsCache.next([]);
  }

  updateBill(bill: Bill) {
    this.db.object(`billing/bills/${bill.id}`).set(bill);
  }
}
