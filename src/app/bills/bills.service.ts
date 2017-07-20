import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
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
    return this.dataStore.getBillsStream()
      .map(bills =>
        bills
          .filter(bill => billMatcher.matches(bill))
          .slice(0, 10)
      ).map(filteredBills => this.wrapSearchResult(term, filteredBills));
  }

  private wrapSearchResult(term: string, filteredBills: Bill[]) {
    return { term, list: filteredBills, dbStatus: this.dataStore.status };
  }
}
