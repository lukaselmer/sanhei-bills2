import { Injectable } from '@angular/core';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';

import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';
import { BillMatcherFactory } from './search/bill-matcher.factory';
import { SearchResult } from './search/search-result';
import { DataStoreService } from './store/data-store.service';

@Injectable()
export class BillsService {
  constructor(private dataStore: DataStoreService, private billMatcherFactory: BillMatcherFactory) {
    this.dataStore.loadData();
  }

  search(term: string): Observable<SearchResult<Bill>> {
    const billMatcher = this.billMatcherFactory.createBillMatcher(term);
    // workaround: the typings of mergeAll are wrong, see https://github.com/ReactiveX/rxjs/pull/2760
    const billsAsObservable: Observable<Bill> = this.dataStore.getBillsStream().mergeAll() as any;
    return billsAsObservable
      .filter(bill => billMatcher.matches(bill))
      .take(10)
      .toArray()
      .map(filteredBills => this.wrapSearchResult(term, filteredBills));
  }

  private wrapSearchResult(term: string, filteredBills: Bill[]) {
    return { term, list: filteredBills, dbStatus: this.dataStore.status };
  }
}
