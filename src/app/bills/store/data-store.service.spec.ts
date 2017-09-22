import { async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { Bill } from './../bill';
import { DataStoreService } from './data-store.service';

describe('DataStoreService', () => {
  let service: DataStoreService;
  const billMock: Bill = {
    id: 1234,
    uid: '17071234',
    address: 'Adresszeile 1\nAdressezeile 2',
    title1: 'Objekt: Adresse',
    title2: 'Zusatz'
  } as any;
  const billsMock = [billMock, billMock];
  const angularFireMock: any = {
    list: () => Observable.of([])
  };
  const idbMock: any = {
    loadFromIDB: () => { },
    storeInIDB: () => Observable.of(null).toPromise()
  };

  beforeEach(() => {
    service = new DataStoreService(angularFireMock, idbMock);
  });

  it('should load partial data from firebase if there is no cache', async(() => {
    spyOn(idbMock, 'loadFromIDB').and.returnValue(Observable.of([]).toPromise());
    spyOn(idbMock, 'storeInIDB').and.callThrough();
    spyOn(angularFireMock, 'list').and.returnValues(
      Observable.of([1, 2]),
      Observable.of([1, 2, 3, 4, 5])
    );

    service.loadData().then(() => {
      expect(idbMock.loadFromIDB).toHaveBeenCalled();
      expect(idbMock.storeInIDB).toHaveBeenCalledTimes(2);
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', [2, 1]);
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', [5, 4, 3, 2, 1]);
      expect(angularFireMock.list).toHaveBeenCalledTimes(2);
      service.getBillsStream().first().subscribe(list => {
        expect(list).toEqual([5, 4, 3, 2, 1] as any);
      });
    });
  }));

  it('should not load partial data from firebase if there is a cache', async(() => {
    spyOn(idbMock, 'loadFromIDB').and.returnValue(Observable.of([3, 2, 1]).toPromise());
    spyOn(idbMock, 'storeInIDB').and.callThrough();
    spyOn(angularFireMock, 'list').and.returnValues(Observable.of([1, 2, 3, 4, 5]));

    service.loadData().then(() => {
      expect(idbMock.loadFromIDB).toHaveBeenCalled();
      expect(idbMock.storeInIDB).toHaveBeenCalledTimes(2);
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', [3, 2, 1]);
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', [5, 4, 3, 2, 1]);
      expect(angularFireMock.list).toHaveBeenCalledTimes(1);
      service.getBillsStream().first().subscribe(list => {
        expect(list).toEqual([5, 4, 3, 2, 1] as any);
      });
    });
  }));
});
