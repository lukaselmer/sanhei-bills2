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
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/toArray';
import { Observable } from 'rxjs/Observable';
import { Article } from './article';
import { Bill } from './bill';
import { BillArticle } from './bill-article';
import { CombinedBillArticle } from './combined-bill-article';
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
      .map(bills => {
        return Observable.from(bills)
          .filter(bill => billMatcher.matches(bill))
          .take(10)
          .toArray();
      })
      .concatAll()
      .catch(e => {
        console.error(e);
        return Observable.of([]);
      })
      .map(filteredBills => this.wrapSearchResult(term, filteredBills));
  }

  private wrapSearchResult(term: string, filteredBills: Bill[]) {
    return { term, list: filteredBills, dbStatus: this.dataStore.status };
  }

  editBill(id: number): Observable<Bill> {
    return this.dataStore.getBillsStream()
      .map(bills => bills.find(bill => bill.id === id))
      .filter(bill => !!bill)
      .map((bill: Bill) => bill);
  }

  async updateBill(bill: Bill, combinedArticles: CombinedBillArticle[]) {
    // TODO: store / update / delete articles and bill articles
    await this.dataStore.updateBill(bill);
  }

  billArticlesForBill(bill: Bill): BillArticle[] {
    const store = this.dataStore.store();
    return Object.keys(store.billArticles)
      .filter(key => store.billArticles[key].billId === bill.id)
      .map(key => store.billArticles[key]);
  }

  articlesForBillArticles(billArticles: BillArticle[]): Article[] {
    const store = this.dataStore.store();
    return billArticles.map(billArticle => store.articles[billArticle.articleId]);
  }

  combinedBillArticlesForBill(bill: Bill): CombinedBillArticle[] {
    const store = this.dataStore.store();
    return this.billArticlesForBill(bill).map(billArticle => {
      const article = store.articles[billArticle.articleId];
      return new CombinedBillArticle(article, billArticle);
    });
  }
}
