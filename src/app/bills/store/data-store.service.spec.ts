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
    list: () => Observable.of([]),
    object: () => Observable.of({})
  };
  const idbMock: any = {
    loadFromIDB: () => undefined,
    storeInIDB: () => Observable.of(null).toPromise()
  };

  beforeEach(() => {
    service = new DataStoreService(angularFireMock, idbMock);
  });

  it('should load data from firebase if there is no cache', async(() => {
    const db = {
      articles: { 1: { id: 1, name: 'A1' }, 2: { id: 2, name: 'A2' } },
      billArticles: { 1: { id: 1, name: 'BA1' }, 2: { id: 2, name: 'BA2' } },
      bills: { 1: { id: 1, name: 'B1' }, 5: { id: 5, name: 'B5' } }
    };
    spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}));
    spyOn(idbMock, 'storeInIDB').and.callThrough();
    spyOn(angularFireMock, 'object').and.returnValues(Observable.of(db));
    spyOn(angularFireMock, 'list').and.returnValue(Observable.of([]));

    service.loadData().then(() => {
      expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(3);
      expect(idbMock.loadFromIDB).toHaveBeenCalledWith('articles');
      expect(idbMock.loadFromIDB).toHaveBeenCalledWith('billArticles');
      expect(idbMock.loadFromIDB).toHaveBeenCalledWith('bills');
      expect(idbMock.storeInIDB).toHaveBeenCalled();
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('articles', { 1: db.articles[1], 2: db.articles[2] });
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('billArticles', { 1: db.billArticles[1], 2: db.billArticles[2] });
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', { 1: db.bills[1], 5: db.bills[5] });
      expect(angularFireMock.list).toHaveBeenCalledTimes(3);
      service.getBillsStream().first().subscribe(list => {
        expect(list).toEqual([{ id: 5, name: 'B5' }, { id: 1, name: 'B1' }] as any);
      });
    });
  }));

  it('should not load partial data from firebase if there is a cache', async(() => {
    spyOn(idbMock, 'loadFromIDB').and.returnValues(
      Observable.of({ 1: { id: 1, name: 'A1' }, 2: { id: 2, name: 'A2' } }).toPromise(),
      Observable.of({ 1: { id: 1, name: 'BA1' }, 2: { id: 2, name: 'BA2' } }).toPromise(),
      Observable.of({ 1: { id: 1, name: 'B1' }, 5: { id: 5, name: 'B5' } }).toPromise()
    );
    spyOn(idbMock, 'storeInIDB').and.callThrough();
    spyOn(angularFireMock, 'list').and.returnValues(
      Observable.of([{ id: 3, name: 'A3' }, { id: 4, name: 'A4' }]),
      Observable.of([]),
      Observable.of([{ id: 2, name: 'B2' }])
    );

    service.loadData().then(() => {
      expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(3);
      expect(idbMock.storeInIDB).toHaveBeenCalledTimes(2);
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('articles', {
        1: { id: 1, name: 'A1' },
        2: { id: 2, name: 'A2' },
        3: { id: 3, name: 'A3' },
        4: { id: 4, name: 'A4' }
      });
      expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
        1: { id: 1, name: 'B1' },
        2: { id: 2, name: 'B2' },
        5: { id: 5, name: 'B5' }
      });
      expect(angularFireMock.list).toHaveBeenCalledTimes(3);
      service.getBillsStream().first().subscribe(list => {
        expect(list).toEqual([{ id: 5, name: 'B5' }, { id: 2, name: 'B2' }, { id: 1, name: 'B1' }] as any);
      });
    });
  }));
});
