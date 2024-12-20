import { waitForAsync } from '@angular/core/testing'
import { count, first } from 'rxjs/operators'
import { billVariant } from './bill.mock'
import { BillsService } from './bills.service'
import { BillMatcherFactory } from './search/bill-matcher.factory'
import { IBillingDatabase } from './store/billing-database'
import { of } from 'rxjs'

describe('BillsService', () => {
  let service: BillsService

  const billMock1 = billVariant({
    id: '1',
    uid: 1001,
    address: 'A street\nSomething',
  })

  const billMock2 = billVariant({
    id: '2',
    uid: 1002,
    address: 'Mr\nHello\nSomething else\nWorld',
  })

  const billsMock = [billMock1, billMock2]

  const db: IBillingDatabase = {
    bills: {
      1: billMock1,
      2: billMock2,
    },
  }

  const dataStoreServiceMock: any = {
    updateBill: () => Promise.resolve(''),
    deleteBill: () => Promise.resolve(''),
    loadData: () => undefined,
    getStoreStream: () => of(db),
    status: 'loaded',
    store: () => db,
  }

  beforeEach(() => {
    spyOn(dataStoreServiceMock, 'loadData')
    service = new BillsService(dataStoreServiceMock, new BillMatcherFactory())
  })

  describe('loading and searching bills', () => {
    it('loads the data when constructed', waitForAsync(() => {
      expect(dataStoreServiceMock.loadData).toHaveBeenCalled()
    }))

    it('does not filter if the filter is empty', waitForAsync(() => {
      service
        .search({
          term: '',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list).toEqual(billsMock)
          expect(searchResult.term).toEqual('')
          expect(searchResult.dbStatus).toEqual('loaded')
        })
    }))

    it('does not filter if the filter is "some"', waitForAsync(() => {
      service
        .search({
          term: 'some',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list).toEqual(billsMock)
          expect(searchResult.term).toEqual('some')
        })
    }))

    it('shows the first if the filter is "a stre"', waitForAsync(() => {
      service
        .search({
          term: 'a stre',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list).toEqual([billMock1])
          expect(searchResult.term).toEqual('a stre')
        })
    }))

    it('shows the second if the filter is "world"', waitForAsync(() => {
      service
        .search({
          term: 'world',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list).toEqual([billMock2])
        })
    }))

    it('shows nothing if the filter is "bla"', waitForAsync(() => {
      service
        .search({
          term: 'bla',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list).toEqual([])
        })
    }))

    it('limits the entries to 10', waitForAsync(() => {
      const a = billMock1
      const b = billMock2
      spyOn(service, 'getBillsStream').and.returnValue(of([a, b, a, b, a, b, a, b, a, b, a, b]))
      service
        .search({
          term: '',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list.length).toEqual(10)
        })
    }))

    it('searches in all entries', waitForAsync(() => {
      const a = billMock1
      const b = billMock2
      spyOn(service, 'getBillsStream').and.returnValue(of([a, b, a, b, a, b, a, b, a, b, a, b]))
      service
        .search({
          term: 'world',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list.length).toEqual(6)
        })
    }))

    it('catches the error if there is one', waitForAsync(() => {
      spyOn(service, 'getBillsStream').and.returnValue(of([null as any, billMock1, billMock2]))
      spyOn(console, 'error')
      service
        .search({
          term: 'world',
          limit: 10,
        })
        .pipe(first())
        .subscribe((searchResult) => {
          expect(searchResult.list).toEqual([])
          expect(console.error).toHaveBeenCalled()
        })
    }))
  })

  describe('editing bills', () => {
    it('returns a bill form when a bill is edited', () => {
      service
        .editBill('2')
        .pipe(first())
        .subscribe((bill) => expect(bill).toEqual(billMock2))
    })

    it('returns nothing if an invalid id is passed', () => {
      expect(
        service
          .editBill('20')
          .pipe(count())
          .subscribe((count) => expect(count).toBe(0)),
      )
    })

    it('updates the bill', async () => {
      spyOn(dataStoreServiceMock, 'updateBill').and.callThrough()
      await service.updateBill(billMock1 as any)
      expect(dataStoreServiceMock.updateBill).toHaveBeenCalledWith(billMock1)
    })
  })

  describe('delete bill', () => {
    it('deletes the bill', async () => {
      spyOn(dataStoreServiceMock, 'deleteBill').and.callThrough()
      await service.deleteBill(billMock1)
      expect(dataStoreServiceMock.deleteBill).toHaveBeenCalledWith({
        ...billMock1,
        humanId: 0,
      })
    })
  })

  describe('mark bill as printed', () => {
    it('marks the bill as printed', async () => {
      spyOn(dataStoreServiceMock, 'updateBill').and.callThrough()
      const bill = billVariant({
        billedAt: '',
      })
      await service.markAsPrinted(bill)
      expect(bill.billedAt.length).toEqual(10)
      expect(dataStoreServiceMock.updateBill).toHaveBeenCalledWith(bill)
    })

    it('does not mark a bill if it was printed already', async () => {
      spyOn(dataStoreServiceMock, 'updateBill').and.callThrough()
      const bill = billVariant({
        billedAt: '2017-05-22',
      })
      await service.markAsPrinted(bill)
      expect(bill.billedAt).toEqual('2017-05-22')
      expect(dataStoreServiceMock.updateBill).not.toHaveBeenCalled()
    })
  })
})
