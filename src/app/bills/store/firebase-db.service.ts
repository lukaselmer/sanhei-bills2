import { Injectable } from '@angular/core'
import {
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
import { Bill } from '../bill'
import { NewBill } from '../new-bill'

@Injectable()
export class FirebaseDbService {
  async dbUpdateBill(db: Database, { id }: { id: string }, billAttributes: Bill) {
    await set(ref(db, `billing/bills/${id}`), billAttributes)
  }

  async dbStoreBill(db: Database, newBill: NewBill) {
    await push(ref(db, 'billing/bills'), newBill)
  }

  async dbDownloadAllBills(db: Database) {
    return get(ref(db, 'billing'))
  }

  dbObserveBills(db: Database, timestamp: number) {
    return listVal<Bill>(query(ref(db, 'billing/bills'), orderByChild('updatedAt'), startAt(timestamp)))
  }
}
