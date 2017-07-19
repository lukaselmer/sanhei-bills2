import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';
import { SearchResult } from './search/search-result';
import { DataStoreService } from './store/data-store.service';

@Injectable()
export class BillsService {
  constructor(private dataStoreService: DataStoreService) {
    this.dataStoreService.loadData();
  }

  search(term: string): Observable<SearchResult<Bill>> {
    return this.dataStoreService.getBillsStream().map(bills => {
      const filteredBills = bills.filter(bill => {
        return (bill.address1 && bill.address1.toLowerCase().startsWith(term)) ||
          (bill.address2 && bill.address2.toLowerCase().startsWith(term)) ||
          (bill.address3 && bill.address3.toLowerCase().startsWith(term)) ||
          (bill.address4 && bill.address4.toLowerCase().startsWith(term));
      }).slice(0, 10);
      return { term, list: filteredBills, dbStatus: this.dataStoreService.status };
    });
  }
}
