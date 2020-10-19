import { async } from '@angular/core/testing'
import { Observable } from 'rxjs/Observable'
import { first } from 'rxjs/operators'
import { Bill } from './../bill'
import { BillsService } from './../bills.service'
import { BillMatcherFactory } from './../search/bill-matcher.factory'
import { DataStoreService } from './data-store.service'

function generateValueChangedEvent(objects: any) {
  return {
    valueChanges: () => Observable.of(objects),
  }
}

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
    list: () => generateValueChangedEvent([]),
    object: () => generateValueChangedEvent({}),
  }
  const idbMock: any = {
    loadFromIDB: () => undefined,
    storeInIDB: () => Promise.resolve(null),
  }

  beforeEach(() => {
    service = new DataStoreService(authMock, angularFireMock, idbMock)
    const spy = spyOn(service, 'loadData')
    billsService = new BillsService(service, new BillMatcherFactory())
    spy.and.callThrough()
  })

  describe('loadData', () => {
    it('should load data from firebase if there is no cache', async(() => {
      const db = {
        bills: {
          1: {
            id: 1,
            name: 'B1',
            createdAt: 100,
          },
          5: {
            id: 5,
            name: 'B5',
            createdAt: 500,
          },
        },
      }
      spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}))
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(angularFireMock, 'object').and.returnValues(generateValueChangedEvent(db))
      spyOn(angularFireMock, 'list').and.returnValue(generateValueChangedEvent([]))

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1)
        expect(idbMock.loadFromIDB).toHaveBeenCalledWith('bills')
        expect(idbMock.storeInIDB).toHaveBeenCalled()
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
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
        })
        expect(angularFireMock.list).toHaveBeenCalledTimes(1)
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
                id: 1,
                name: 'B1',
                createdAt: 100,
                articles: [],
              },
            ] as any)
          })
      })
    }))

    it('should not store deleted entries if there is no cache', async(() => {
      const db = {
        bills: {
          1: { id: 1, name: 'B1' },
          5: {
            id: 5,
            name: 'B5',
            deletedAt: 12345,
          },
        },
      }
      spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}))
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(angularFireMock, 'object').and.returnValues(generateValueChangedEvent(db))
      spyOn(angularFireMock, 'list').and.returnValue(generateValueChangedEvent([]))

      service.loadData().then(() => {
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          1: {
            id: 1,
            name: 'B1',
            articles: [],
          },
        })
        billsService
          .getBillsStream()
          .pipe(first())
          .subscribe((list) => {
            expect(list).toEqual([{ id: 1, name: 'B1', articles: [] }] as any)
          })
      })
    }))

    it('should not load partial data from firebase if there is a cache', async(() => {
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
        })
      )
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(angularFireMock, 'list').and.returnValues(
        generateValueChangedEvent([
          {
            id: 2,
            name: 'B2',
            createdAt: 200,
          },
        ])
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
        expect(angularFireMock.list).toHaveBeenCalledTimes(1)
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

    it('should delete entries marked as deleted', async(() => {
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
        })
      )
      spyOn(idbMock, 'storeInIDB').and.callThrough()
      spyOn(angularFireMock, 'list').and.returnValues(
        generateValueChangedEvent([
          {
            id: 1,
            name: 'B1',
            deletedAt: 12345,
          },
        ])
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
        expect(angularFireMock.list).toHaveBeenCalledTimes(1)
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
      it('updates the bill in firebase', async(async () => {
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
          })
        )
        spyOn(idbMock, 'storeInIDB').and.callThrough()

        let latestUpdatedBill: any
        spyOn(angularFireMock, 'object').and.returnValue({
          set: (newBill: Bill) => (latestUpdatedBill = newBill),
        })

        await service.loadData()
        const bills = await billsService.getBillsStream().pipe(first()).toPromise()
        const latestBill: Bill = {
          ...bills[0],
          title: 'newTitle',
        }
        await service.updateBill(latestBill as any)
        expect(angularFireMock.object).toHaveBeenCalledWith(`billing/bills/${latestBill.id}`)
        expect(latestUpdatedBill).toEqual(latestBill)
      }))
    })
  })
})
