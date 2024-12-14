import { Injectable } from '@angular/core'
import { Auth } from '@angular/fire/auth'
import {
  serverTimestamp,
  Database,
  ref,
  query,
  listVal,
  orderByChild,
  startAt,
  push,
  set,
  get,
} from '@angular/fire/database'
import { BehaviorSubject, type Observable } from 'rxjs'
import { Bill } from '../bill'
import { EditedBill } from './../edited-bill'
import { NewBill } from './../new-bill'
import { IBillingDatabase } from './billing-database'
import { DataStoreStatus } from './data-store-status'
import { IDBStoreService } from './idb-store.service'

@Injectable()
export class DataStoreService {
  private readonly storeStream = new BehaviorSubject<IBillingDatabase>({ bills: {} })

  status: DataStoreStatus = 'idle'

  static toArray<T extends { id: string }>(items: { [index: string]: T }): T[] {
    return Object.keys(items).map((key) => items[key])
  }

  constructor(
    private readonly auth: Auth,
    private readonly db: Database,
    private readonly idbStoreService: IDBStoreService,
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

    listVal<Bill>(
      query(ref(this.db, 'billing/bills'), orderByChild('updatedAt'), startAt(this.nextSyncTimestamp())),
    ).subscribe(async (bills: Bill[]) => {
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
      ...DataStoreService.toArray(this.store().bills).map((el) => el.updatedAt),
    )
    return currentMaxTimestamp + 1
  }

  private async downloadWholeDatabase() {
    const snapshot = await get(ref(this.db, 'billing'))
    if (!snapshot.exists()) throw new Error('No data found')
    const data: IBillingDatabase = await snapshot.val()
    if (!data) throw new Error('No data found')
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
    await push(ref(this.db, 'billing/bills'), newBill)
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
    await set(ref(this.db, `billing/bills/${bill.id}`), billAttributes)
  }

  async deleteBill(bill: Bill) {
    await this.waitForUserLogin()
    this.setDeleted(bill)
    await set(ref(this.db, `billing/bills/${bill.id}`), bill)
  }

  private setCreated(newBill: NewBill) {
    newBill.createdAt = serverTimestamp()
    this.setUpdated(newBill)
  }

  private setDeleted(dbObject: Bill) {
    dbObject.deletedAt = serverTimestamp() as unknown as number
    this.setUpdated(dbObject)
  }

  private setUpdated(bill: Bill | NewBill | EditedBill) {
    bill.updatedAt = serverTimestamp()
  }

  private async waitForUserLogin() {
    // eslint-disable-next-line no-empty
    while (await this.waitingForUserLogin()) {}
  }

  private async waitingForUserLogin(): Promise<boolean> {
    const user = await this.auth.currentUser
    return new Promise((res) => setTimeout(() => res(!user), 100))
  }
}
