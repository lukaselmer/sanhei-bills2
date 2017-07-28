import { async } from '@angular/core/testing';
import { BillsService } from 'app/bills/bills.service';
import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';
import { billVariant } from './bill.mock';
import { BillMatcherFactory } from './search/bill-matcher.factory';

describe('BillsService', () => {
  let service: BillsService;
  const billMock1 = billVariant({
    id: 1,
    uid: 1001,
    address1: 'A street',
    address2: 'Something',
    address3: '',
    address4: '',
    address5: ''
  });
  const billMock2 = billVariant({
    id: 2,
    uid: 1002,
    address1: 'Mr',
    address2: 'Hello',
    address3: 'Something else',
    address4: 'World',
    address5: ''
  });
  const billsMock = [billMock1, billMock2];
  const dataStoreServiceMock: any = {
    loadData: () => { },
    getBillsStream: () => Observable.of(billsMock),
    status: 'loaded'
  };

  beforeEach(() => {
    spyOn(dataStoreServiceMock, 'loadData');
    service = new BillsService(dataStoreServiceMock, new BillMatcherFactory());
  });

  describe('loading and searching bills', () => {
    it('loads the data when constructed', async(() => {
      expect(dataStoreServiceMock.loadData).toHaveBeenCalled();
    }));

    it('does not filter if the filter is empty', async(() => {
      service.search('').first().subscribe(searchResult => {
        expect(searchResult.list).toEqual(billsMock);
        expect(searchResult.term).toEqual('');
        expect(searchResult.dbStatus).toEqual('loaded');
      });
    }));

    it('does not filter if the filter is "some"', async(() => {
      service.search('some').first().subscribe(searchResult => {
        expect(searchResult.list).toEqual(billsMock);
        expect(searchResult.term).toEqual('some');
      });
    }));

    it('shows the first if the filter is "a stre"', async(() => {
      service.search('a stre').first().subscribe(searchResult => {
        expect(searchResult.list).toEqual([billMock1]);
        expect(searchResult.term).toEqual('a stre');
      });
    }));

    it('shows the second if the filter is "world"', async(() => {
      service.search('world').first().subscribe(searchResult => {
        expect(searchResult.list).toEqual([billMock2]);
      });
    }));

    it('shows nothing if the filter is "bla"', async(() => {
      service.search('bla').first().subscribe(searchResult => {
        expect(searchResult.list).toEqual([]);
      });
    }));

    it('limits the entries to 10', async(() => {
      const a = billMock1;
      const b = billMock2;
      spyOn(dataStoreServiceMock, 'getBillsStream').and.returnValue(Observable.of([a, b, a, b, a, b, a, b, a, b, a, b]));
      service.search('').first().subscribe(searchResult => {
        expect(searchResult.list.length).toEqual(10);
      });
    }));

    it('searches in all entries', async(() => {
      const a = billMock1;
      const b = billMock2;
      spyOn(dataStoreServiceMock, 'getBillsStream').and.returnValue(Observable.of([a, b, a, b, a, b, a, b, a, b, a, b]));
      service.search('world').first().subscribe(searchResult => {
        expect(searchResult.list.length).toEqual(6);
      });
    }));

    it('catches the error if there is one', async(() => {
      spyOn(dataStoreServiceMock, 'getBillsStream').and.returnValue(Observable.of([null, billMock1, billMock2]));
      spyOn(console, 'error');
      service.search('world').first().subscribe(searchResult => {
        expect(searchResult.list).toEqual([]);
        expect(console.error).toHaveBeenCalled();
      });
    }));
  });
});
