import { Bill } from './../bill';
import { IDBStoreService } from './idb-store.service';

describe('IDBStoreService', () => {
  const billMock: Bill = {
    id: 1234,
    uid: '17071234',
    address1: 'Adresszeile 1\nAdressezeile 2',
    title1: 'Objekt: Adresse',
    title2: 'Zusatz'
  } as any;
  const billsMock = { 1: billMock, 2: billMock };

  beforeEach(() => {
    indexedDB.deleteDatabase('sanheiBilling');
  });

  it('should store and read bills in the db', ((done: any) => {
    new IDBStoreService().loadFromIDB('bills').then(billsBeforeStore => {
      expect(billsBeforeStore).toEqual({});
      new IDBStoreService().storeInIDB('bills', billsMock).then(() => {
        new IDBStoreService().loadFromIDB('bills').then(bills => {
          expect(bills).toEqual(billsMock);
          done();
        }).catch(e => fail(e) || done());
      }).catch(e => fail(e) || done());
    });
  }));
});
