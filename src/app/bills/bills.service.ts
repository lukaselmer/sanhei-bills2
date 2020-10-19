import { from as observableFrom, Observable, of as observableOf } from 'rxjs'

import { Injectable } from '@angular/core'
import { catchError, concatAll, filter, map, take, toArray } from 'rxjs/operators'
import { currentDateAsISO8601 } from '../shared/date-helper'
import { Article } from './article'
import { Bill } from './bill'
import { EditedBill } from './edited-bill'
import { NewBill } from './new-bill'
import { BillMatcherFactory } from './search/bill-matcher.factory'
import { SearchOptions } from './search/search-options'
import { SearchResult } from './search/search-result'
import { IBillingDatabase } from './store/billing-database'
import { DataStoreService } from './store/data-store.service'

@Injectable()
export class BillsService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly billMatcherFactory: BillMatcherFactory
  ) {
    this.dataStore.loadData()
  }

  getBills(): Bill[] {
    return this.convertBills(this.dataStore.store())
  }

  getBillsStream(): Observable<Bill[]> {
    return this.dataStore.getStoreStream().pipe(map((store) => this.convertBills(store)))
  }

  private convertBills(store: IBillingDatabase) {
    return DataStoreService.toArray(store.bills).sort((a, b) => b.createdAt - a.createdAt)
  }

  search(options: SearchOptions): Observable<SearchResult<Bill>> {
    const billMatcher = this.billMatcherFactory.createBillMatcher(options)

    return this.getBillsStream().pipe(
      map((bills) => {
        return observableFrom(bills).pipe(
          filter((bill) => billMatcher.matches(bill)),
          take(options.limit),
          toArray()
        )
      }),
      concatAll(),
      catchError((e) => {
        console.error(e)
        return observableOf([])
      }),
      map((filteredBills) => this.wrapSearchResult(options.term, filteredBills))
    )
  }

  private wrapSearchResult(term: string, filteredBills: Bill[]) {
    return {
      term,
      list: filteredBills,
      dbStatus: this.dataStore.status,
    }
  }

  editBill(id: string): Observable<Bill> {
    return this.getBillsStream().pipe(
      map((bills) => bills.find((bill) => bill.id === id)),
      filter((bill) => !!bill)
    ) as Observable<Bill>
  }

  async updateBill(bill: EditedBill) {
    await this.dataStore.updateBill(bill)
  }

  async deleteBill(bill: Bill) {
    bill.humanId = 0
    await this.dataStore.deleteBill(bill)
  }

  async createBill(newBill: NewBill) {
    await this.dataStore.createBill(newBill)
  }

  async markAsPrinted(bill: Bill) {
    if (bill.billedAt) return

    bill.billedAt = currentDateAsISO8601()
    await this.dataStore.updateBill(bill)
  }
}
