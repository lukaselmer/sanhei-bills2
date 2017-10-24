import { Injectable } from '@angular/core';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/toArray';
import { Observable } from 'rxjs/Observable';
import { currentDateAsISO8601 } from '../shared/date-helper';
import { Article } from './article';
import { ArticlesService } from './articles.service';
import { Bill } from './bill';
import { EditedBill } from './edited-bill';
import { NewBill } from './new-bill';
import { BillMatcherFactory } from './search/bill-matcher.factory';
import { SearchOptions } from './search/search-options';
import { SearchResult } from './search/search-result';
import { DataStoreService } from './store/data-store.service';

@Injectable()
export class BillsService {
  constructor(
    private dataStore: DataStoreService,
    private billMatcherFactory: BillMatcherFactory) {
    this.dataStore.loadData();
  }

  search(options: SearchOptions): Observable<SearchResult<Bill>> {
    const billMatcher = this.billMatcherFactory.createBillMatcher(options);

    return this.dataStore.getBillsStream()
      .map(bills => {
        return Observable.from(bills)
          .filter(bill => billMatcher.matches(bill))
          .take(options.limit)
          .toArray();
      })
      .concatAll()
      .catch(e => {
        console.error(e);
        return Observable.of([]);
      })
      .map(filteredBills => this.wrapSearchResult(options.term, filteredBills));
  }

  private wrapSearchResult(term: string, filteredBills: Bill[]) {
    return { term, list: filteredBills, dbStatus: this.dataStore.status };
  }

  editBill(id: string): Observable<Bill> {
    return this.dataStore.getBillsStream()
      .map(bills => bills.find(bill => bill.id === id))
      .filter(bill => !!bill)
      .map((bill: Bill) => bill);
  }

  async updateBill(bill: EditedBill) {
    await this.dataStore.updateBill(bill);
  }

  async deleteBill(bill: Bill) {
    await this.dataStore.deleteBill(bill);
  }

  async createBill(newBill: NewBill) {
    await this.dataStore.createBill(newBill);
  }

  async markAsPrinted(bill: Bill) {
    if (bill.billedAt) return;

    bill.billedAt = currentDateAsISO8601();
    await this.dataStore.updateBill(bill);
  }
}
