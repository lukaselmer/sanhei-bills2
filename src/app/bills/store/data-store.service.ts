import { Injectable } from '@angular/core'
import { AngularFireDatabase } from '@angular/fire/compat/database'
import firebase from 'firebase/compat/app'
import { first } from 'rxjs/operators'

import { BehaviorSubject, Observable } from 'rxjs'
import { Bill } from '../bill'
import { EditedBill } from './../edited-bill'
import { NewBill } from './../new-bill'
import { IBillingDatabase } from './billing-database'
import { DataStoreStatus } from './data-store-status'
import { IDBStoreService } from './idb-store.service'
import { AngularFireAuth } from '@angular/fire/compat/auth'

@Injectable()
export class DataStoreService {
  private readonly storeStream = new BehaviorSubject<IBillingDatabase>({ bills: {} })

  status: DataStoreStatus = 'idle'

  static toArray<T extends { id: string }>(items: { [index: string]: T }): T[] {
    return Object.keys(items).map((key) => items[key])
  }

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly db: AngularFireDatabase,
    private readonly idbStoreService: IDBStoreService
  ) {}

  getStoreStream(): Observable<IBillingDatabase> {
    return this.storeStream.asObservable()
  }

  store(): IBillingDatabase {
    return this.storeStream.getValue()
  }

  async loadData(): Promise<void> {
    await this.waitForUserLogin()

    if (this.status !== 'idle') return Promise.resolve(undefined)

    this.status = 'loading'
    await this.loadCachedDataFromIDB()
    await this.initializeFirebaseSync()
  }

  private async loadCachedDataFromIDB(): Promise<void> {
    const bills = await this.idbStoreService.loadFromIDB<Bill>('bills')
    this.status = 'loadedFromIDB'
    if (Object.keys(bills).length > 0) this.status = 'loaded'
    this.storeStream.next({ bills })
  }

  private async initializeFirebaseSync() {
    if (Object.keys(this.store().bills).length === 0) {
      await this.downloadWholeDatabase()
      await this.idbStoreService.storeInIDB('bills', this.store().bills)
    }

    this.db
      .list<Bill>('billing/bills', (query) =>
        query.orderByChild('updatedAt').startAt(this.nextSyncTimestamp())
      )
      .valueChanges()
      .subscribe(async (bills: Bill[]) => {
        if (bills.length === 0) return

        const store = this.store()
        bills.forEach((bill) => {
          if (!bill.articles) bill.articles = []
          if (bill.id) store.bills[bill.id] = bill
          if (bill.deletedAt) delete store.bills[bill.id]
        })
        this.storeStream.next(store)
        await this.idbStoreService.storeInIDB('bills', store.bills)
      })
  }

  private nextSyncTimestamp(): number {
    const currentMaxTimestamp = Math.max(
      ...DataStoreService.toArray(this.store().bills).map((el) => el.updatedAt)
    )
    return currentMaxTimestamp + 1
  }

  private async downloadWholeDatabase() {
    const data: IBillingDatabase = (await this.db
      .object('billing')
      .valueChanges()
      .pipe(first())
      .toPromise()) as IBillingDatabase
    this.status = 'loaded'
    this.correctBills(data)
    this.correctArticles(data)
    this.removeDeleted(data)
    this.storeStream.next(data)
  }

  private correctBills(data: IBillingDatabase) {
    Object.keys(data.bills).forEach((id) => {
      if (!data.bills[id].id) data.bills[id].id = id
    })
  }

  private correctArticles(data: IBillingDatabase) {
    Object.keys(data.bills).forEach((id) => {
      if (!data.bills[id].articles) data.bills[id].articles = []
    })
  }

  private removeDeleted(data: IBillingDatabase) {
    Object.keys(data.bills).forEach((id) => {
      if (data.bills[id].deletedAt) delete data.bills[id]
    })
  }

  async createBill(newBill: NewBill): Promise<void> {
    await this.waitForUserLogin()
    this.setCreated(newBill)
    await this.db.list<NewBill>(`billing/bills`).push(newBill)
  }

  async updateBill(bill: EditedBill | Bill) {
    await this.waitForUserLogin()
    this.setUpdated(bill)
    const billAttributes = {
      ...bill,
    } as any
    Object.keys(billAttributes).forEach((k) => {
      if (billAttributes[k] === undefined) delete billAttributes[k]
    })
    await this.db.object(`billing/bills/${bill.id}`).set(billAttributes)
  }

  async deleteBill(bill: Bill) {
    await this.waitForUserLogin()
    this.setDeleted(bill)
    await this.db.object(`billing/bills/${bill.id}`).set(bill)
  }

  private setCreated(newBill: NewBill) {
    newBill.createdAt = firebase.database.ServerValue.TIMESTAMP
    this.setUpdated(newBill)
  }

  private setDeleted(dbObject: Bill) {
    dbObject.deletedAt = firebase.database.ServerValue.TIMESTAMP as number
    this.setUpdated(dbObject)
  }

  private setUpdated(bill: Bill | NewBill | EditedBill) {
    bill.updatedAt = firebase.database.ServerValue.TIMESTAMP
  }

  private async waitForUserLogin() {
    while (await this.waitingForUserLogin()) {}
  }

  private async waitingForUserLogin(): Promise<boolean> {
    const user = await this.auth.currentUser
    return new Promise((res) => setTimeout(() => res(!user), 100))
  }
}
