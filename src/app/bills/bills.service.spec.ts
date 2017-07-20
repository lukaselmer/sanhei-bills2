import { async } from '@angular/core/testing';
import { BillsService } from 'app/bills/bills.service';
import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';
import { BillMatcherService } from './search/bill-matcher.service';

describe('BillsService', () => {
  let service: BillsService;
  const billMock1: Bill = {
    id: 1,
    uid: 1001,
    address1: 'A street',
    address2: 'Something'
  } as any;
  const billMock2: Bill = {
    id: 2,
    uid: 1002,
    address1: 'Mr',
    address2: 'Hello',
    address3: 'Something else',
    address4: 'World'
  } as any;
  const billsMock = [billMock1, billMock2];
  const dataStoreServiceMock: any = {
    loadData: () => { },
    getBillsStream: () => Observable.of(billsMock),
    status: 'loaded'
  };

  beforeEach(() => {
    spyOn(dataStoreServiceMock, 'loadData');
    service = new BillsService(dataStoreServiceMock, new BillMatcherService());
  });

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
});
