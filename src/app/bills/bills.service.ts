import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';
import { BillMatcherService } from './search/bill-matcher.service';
import { SearchResult } from './search/search-result';
import { DataStoreService } from './store/data-store.service';

@Injectable()
export class BillsService {
  constructor(private dataStore: DataStoreService, private billMatcher: BillMatcherService) {
    this.dataStore.loadData();
  }

  search(term: string): Observable<SearchResult<Bill>> {
    return this.dataStore.getBillsStream().map(bills => {
      const filteredBills = bills
        .filter(bill => this.billMatcher.matches(term, bill))
        .slice(0, 10);
      return { term, list: filteredBills, dbStatus: this.dataStore.status };
    });
  }
}
