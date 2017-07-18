import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';
import { SearchResult } from './search/search-result';

@Injectable()
export class BillsService {
  private billsCache = new BehaviorSubject<Bill[]>([]);
  private status: 'loading' | 'partiallyLoaded' | 'loaded' = 'loading';

  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
    this.forIndex().subscribe(firstBills => {
      this.status = 'partiallyLoaded';
      this.billsCache.next(firstBills.reverse());
      this.db.list('billing/bills', {
        query: { orderByChild: 'id' }
      }).subscribe(allBills => {
        this.status = 'loaded';
        this.billsCache.next(allBills.reverse());
      });
    });
  }

  private forIndex(): Observable<Bill[]> {
    return this.db.list('billing/bills', {
      query: { limitToLast: 1, orderByChild: 'id' }
    });
  }

  search(term: string): Observable<SearchResult<Bill>> {
    return this.billsCache.map(allBills => {
      const bills = allBills.filter(bill => {
        return (bill.address1 && bill.address1.startsWith(term)) ||
          (bill.address2 && bill.address2.startsWith(term)) ||
          (bill.address3 && bill.address3.startsWith(term)) ||
          (bill.address4 && bill.address4.startsWith(term));
      }).slice(0, 10);
      return { term, list: bills, dbStatus: this.status };
    });
  }
}
