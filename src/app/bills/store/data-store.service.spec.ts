import { waitForAsync } from '@angular/core/testing'
import { first } from 'rxjs/operators'
import { Bill } from './../bill'
import { BillsService } from './../bills.service'
import { BillMatcherFactory } from './../search/bill-matcher.factory'
import { DataStoreService } from './data-store.service'
import { lastValueFrom, of } from 'rxjs'
import { FirebaseDbService } from 'app/bills/store/firebase-db.service'
import { DataSnapshot } from 'firebase/database'

describe('DataStoreService', () => {
  let service: DataStoreService
  let billsService: BillsService
  const billMock: Bill = {
    id: 1234,
    uid: '17071234',
    address: 'Adresszeile 1\nAdressezeile 2',
    title: 'Objekt: Adresse',
    descriptionTitle: 'Zusatz',
  } as any
  const billsMock = [billMock, billMock]
  const authMock: any = { currentUser: () => Promise.resolve({ a: 'mock user' }) }
  const angularFireMock: any = {
    list: () => of([]),
    object: () => of({}),
  }
  const firebaseDbServiceMock: any = {
    dbUpdateBill: () => Promise.resolve(),
    dbStoreBill: () => Promise.resolve(),
    dbDownloadAllBills: () => resolveSnapshot({}),
    dbObserveBills: () => of([]),
  } // as FirebaseDbService
  const idbMock: any = {
    loadFromIDB: () => undefined,
    storeInIDB: () => Promise.resolve(null),
  }

  beforeEach(() => {
    service = new DataStoreService(authMock, angularFireMock, idbMock, firebaseDbServiceMock)
    const spy = spyOn(service, 'loadData')
    billsService = new BillsService(service, new BillMatcherFactory())
    spy.and.callThrough()
  })

  describe('loadData', () => {
    it('should load data from firebase if there is no cache', waitForAsync(() => {
      const db = {
        bills: {
          1: { id: 1, name: 'B1', createdAt: 100 },
          5: { id: 5, name: 'B5', createdAt: 500 },
        },
      }
      expect(1).toBe(1)
      spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}))
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(firebaseDbServiceMock, 'dbDownloadAllBills').and.returnValues(resolveSnapshot(db))
      spyOn(firebaseDbServiceMock, 'dbObserveBills').and.returnValue(of([]))

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1)
        expect(idbMock.loadFromIDB).toHaveBeenCalledWith('bills')
        // expect(idbMock.storeInIDB).toHaveBeenCalled()
        // expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
        //   1: { id: 1, name: 'B1', createdAt: 100, articles: [] },
        //   5: { id: 5, name: 'B5', createdAt: 500, articles: [] },
        // })
        // expect(firebaseDbServiceMock.list).toHaveBeenCalledTimes(1)
        // billsService
        //   .getBillsStream()
        //   .pipe(first())
        //   .subscribe((list) => {
        //     expect(list).toEqual([
        //       { id: 5, name: 'B5', createdAt: 500, articles: [] },
        //       { id: 1, name: 'B1', createdAt: 100, articles: [] },
        //     ] as any)
        //   })
      })
    }))

    it('should not store deleted entries if there is no cache', waitForAsync(() => {
      const db = {
        bills: {
          1: { id: 1, name: 'B1' },
          5: { id: 5, name: 'B5', deletedAt: 12345 },
        },
      }
      spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}))
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(firebaseDbServiceMock, 'dbDownloadAllBills').and.returnValues(resolveSnapshot(db))
      spyOn(firebaseDbServiceMock, 'dbObserveBills').and.returnValue(of([]))

      service.loadData().then(() => {
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          1: { id: 1, name: 'B1', articles: [] },
        })
        billsService
          .getBillsStream()
          .pipe(first())
          .subscribe((list) => {
            expect(list).toEqual([{ id: 1, name: 'B1', articles: [] }] as any)
          })
      })
    }))

    it('should not load partial data from firebase if there is a cache', waitForAsync(() => {
      spyOn(idbMock, 'loadFromIDB').and.returnValues(
        Promise.resolve({
          1: {
            id: 1,
            name: 'B1',
            createdAt: 100,
            articles: [],
          },
          5: {
            id: 5,
            name: 'B5',
            createdAt: 500,
            articles: [],
          },
        }),
      )
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(firebaseDbServiceMock, 'dbObserveBills').and.returnValues(
        of([
          {
            id: 2,
            name: 'B2',
            createdAt: 200,
          },
        ]),
      )

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1)
        expect(idbMock.storeInIDB).toHaveBeenCalledTimes(1)
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          1: {
            id: 1,
            name: 'B1',
            createdAt: 100,
            articles: [],
          },
          2: {
            id: 2,
            name: 'B2',
            createdAt: 200,
            articles: [],
          },
          5: {
            id: 5,
            name: 'B5',
            createdAt: 500,
            articles: [],
          },
        })
        expect(firebaseDbServiceMock.dbObserveBills).toHaveBeenCalledTimes(1)
        billsService
          .getBillsStream()
          .pipe(first())
          .subscribe((list) => {
            expect(list).toEqual([
              {
                id: 5,
                name: 'B5',
                createdAt: 500,
                articles: [],
              },
              {
                id: 2,
                name: 'B2',
                createdAt: 200,
                articles: [],
              },
              {
                id: 1,
                name: 'B1',
                createdAt: 100,
                articles: [],
              },
            ] as any)
          })
      })
    }))

    it('should delete entries marked as deleted', waitForAsync(() => {
      spyOn(idbMock, 'loadFromIDB').and.returnValues(
        Promise.resolve({
          1: {
            id: 1,
            name: 'B1',
            articles: [],
          },
          5: {
            id: 5,
            name: 'B5',
            articles: [],
          },
        }),
      )
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(firebaseDbServiceMock, 'dbObserveBills').and.returnValues(
        of([
          {
            id: 1,
            name: 'B1',
            deletedAt: 12345,
          },
        ]),
      )

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1)
        expect(idbMock.storeInIDB).toHaveBeenCalledTimes(1)
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          5: {
            id: 5,
            name: 'B5',
            articles: [],
          },
        })
        expect(firebaseDbServiceMock.dbObserveBills).toHaveBeenCalledTimes(1)
        billsService
          .getBillsStream()
          .pipe(first())
          .subscribe((list) => {
            expect(list).toEqual([{ id: 5, name: 'B5', articles: [] }] as any)
          })
      })
    }))
  })

  describe('updateBill', () => {
    describe('when online', () => {
      it('updates the bill in firebase', waitForAsync(async () => {
        spyOn(idbMock, 'loadFromIDB').and.returnValues(
          Promise.resolve({
            1: {
              id: 1,
              title: 'B1',
              articles: [],
            },
            5: {
              id: 5,
              title: 'B5',
              articles: [],
            },
          }),
        )
        spyOn(idbMock, 'storeInIDB').and.callThrough()
        let latestId: any
        let latestUpdatedBill: any
        spyOn(firebaseDbServiceMock, 'dbUpdateBill').and.callFake(
          (_db: any, billWithId: { id: string }, newBill: Bill) => {
            latestId = billWithId.id
            latestUpdatedBill = newBill
          },
        )
        await service.loadData()
        const bills = await lastValueFrom(billsService.getBillsStream().pipe(first()))
        const latestBill: Bill = { ...bills[0], title: 'newTitle' }
        await service.updateBill(latestBill as any)
        expect(firebaseDbServiceMock.dbUpdateBill).toHaveBeenCalledWith(
          angularFireMock,
          { id: latestBill.id },
          latestBill,
        )
        expect(latestId).toEqual(latestBill.id)
        expect(latestUpdatedBill).toEqual(latestBill)
      }))
    })
  })
})

function resolveSnapshot(data: any) {
  return Promise.resolve({ val: () => data, exists: () => true } as DataSnapshot)
}
