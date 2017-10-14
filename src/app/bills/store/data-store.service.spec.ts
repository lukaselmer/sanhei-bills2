import { async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Bill } from './../bill';
import { DataStoreService } from './data-store.service';

function generateValueChangedEvent(objects: any) {
  return { valueChanges: () => Observable.of(objects) };
}

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
    list: () => generateValueChangedEvent([]),
    object: () => generateValueChangedEvent({})
  };
  const idbMock: any = {
    loadFromIDB: () => undefined,
    storeInIDB: () => Promise.resolve(null)
  };

  beforeEach(() => {
    service = new DataStoreService(angularFireMock, idbMock);
  });

  describe('loadData', () => {
    it('should load data from firebase if there is no cache', async(() => {
      const db = {
        bills: {
          1: { id: 1, name: 'B1', createdAt: 100 },
          5: { id: 5, name: 'B5', createdAt: 500 }
        }
      };
      spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}));
      spyOn(idbMock, 'storeInIDB').and.callThrough();
      spyOn(angularFireMock, 'object').and.returnValues(generateValueChangedEvent(db));
      spyOn(angularFireMock, 'list').and.returnValue(generateValueChangedEvent([]));

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1);
        expect(idbMock.loadFromIDB).toHaveBeenCalledWith('bills');
        expect(idbMock.storeInIDB).toHaveBeenCalled();
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          1: { id: 1, name: 'B1', createdAt: 100, articles: [] },
          5: { id: 5, name: 'B5', createdAt: 500, articles: [] }
        });
        expect(angularFireMock.list).toHaveBeenCalledTimes(1);
        service.getBillsStream().first().subscribe(list => {
          expect(list).toEqual([
            { id: 5, name: 'B5', createdAt: 500, articles: [] },
            { id: 1, name: 'B1', createdAt: 100, articles: [] }
          ] as any);
        });
      });
    }));

    it('should not store deleted entries if there is no cache', async(() => {
      const db = {
        bills: {
          1: { id: 1, name: 'B1' },
          5: { id: 5, name: 'B5', deletedAt: 12345 }
        }
      };
      spyOn(idbMock, 'loadFromIDB').and.returnValue(Promise.resolve({}));
      spyOn(idbMock, 'storeInIDB').and.callThrough();
      spyOn(angularFireMock, 'object').and.returnValues(generateValueChangedEvent(db));
      spyOn(angularFireMock, 'list').and.returnValue(generateValueChangedEvent([]));

      service.loadData().then(() => {
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          1: { id: 1, name: 'B1', articles: [] }
        });
        service.getBillsStream().first().subscribe(list => {
          expect(list).toEqual([{ id: 1, name: 'B1', articles: [] }] as any);
        });
      });
    }));

    it('should not load partial data from firebase if there is a cache', async(() => {
      spyOn(idbMock, 'loadFromIDB').and.returnValues(
        Promise.resolve({
          1: { id: 1, name: 'B1', createdAt: 100, articles: [] },
          5: { id: 5, name: 'B5', createdAt: 500, articles: [] }
        })
      );
      spyOn(idbMock, 'storeInIDB').and.callThrough();
      spyOn(angularFireMock, 'list').and.returnValues(
        generateValueChangedEvent([{ id: 2, name: 'B2', createdAt: 200 }])
      );

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1);
        expect(idbMock.storeInIDB).toHaveBeenCalledTimes(1);
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          1: { id: 1, name: 'B1', createdAt: 100, articles: [] },
          2: { id: 2, name: 'B2', createdAt: 200, articles: [] },
          5: { id: 5, name: 'B5', createdAt: 500, articles: [] }
        });
        expect(angularFireMock.list).toHaveBeenCalledTimes(1);
        service.getBillsStream().first().subscribe(list => {
          expect(list).toEqual([
            { id: 5, name: 'B5', createdAt: 500, articles: [] },
            { id: 2, name: 'B2', createdAt: 200, articles: [] },
            { id: 1, name: 'B1', createdAt: 100, articles: [] }
          ] as any);
        });
      });
    }));

    it('should delete entries marked as deleted', async(() => {
      spyOn(idbMock, 'loadFromIDB').and.returnValues(
        Promise.resolve({ 1: { id: 1, name: 'B1', articles: [] }, 5: { id: 5, name: 'B5', articles: [] } })
      );
      spyOn(idbMock, 'storeInIDB').and.callThrough();
      spyOn(angularFireMock, 'list').and.returnValues(
        generateValueChangedEvent([{ id: 1, name: 'B1', deletedAt: 12345 }])
      );

      service.loadData().then(() => {
        expect(idbMock.loadFromIDB).toHaveBeenCalledTimes(1);
        expect(idbMock.storeInIDB).toHaveBeenCalledTimes(1);
        expect(idbMock.storeInIDB).toHaveBeenCalledWith('bills', {
          5: { id: 5, name: 'B5', articles: [] }
        });
        expect(angularFireMock.list).toHaveBeenCalledTimes(1);
        service.getBillsStream().first().subscribe(list => {
          expect(list).toEqual([{ id: 5, name: 'B5', articles: [] }] as any);
        });
      });
    }));
  });

  describe('updateBill', () => {
    describe('when online', () => {
      it('updates the bill in firebase', async(async () => {
        spyOn(idbMock, 'loadFromIDB').and.returnValues(
          Promise.resolve({
            1: { id: 1, title1: 'B1', articles: [] },
            5: { id: 5, title1: 'B5', articles: [] }
          })
        );
        spyOn(idbMock, 'storeInIDB').and.callThrough();

        let latestUpdatedBill: any;
        spyOn(angularFireMock, 'object').and.returnValue({ set: (newBill: Bill) => latestUpdatedBill = newBill });

        await service.loadData();
        const bills = await service.getBillsStream().first().toPromise();
        const latestBill: Bill = { ...bills[0], title1: 'newTitle' };
        await service.updateBill(latestBill);
        expect(angularFireMock.object).toHaveBeenCalledWith(`billing/bills/${latestBill.id}`);
        expect(latestUpdatedBill).toEqual(latestBill);
      }));
    });
  });
});
