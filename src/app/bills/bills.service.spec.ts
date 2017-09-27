import { async } from '@angular/core/testing';
import 'rxjs/add/operator/count';
import { Observable } from 'rxjs/Observable';
import { articleVariant } from './article.mock';
import { billArticleVariant } from './bill-article.mock';
import { billVariant } from './bill.mock';
import { BillsService } from './bills.service';
import { BillMatcherFactory } from './search/bill-matcher.factory';
import { IBillingDatabase } from './store/billing-database';

describe('BillsService', () => {
  let service: BillsService;
  const billMock1 = billVariant({
    id: 1,
    uid: 1001,
    address: 'A street\nSomething'
  });
  const billMock2 = billVariant({
    id: 2,
    uid: 1002,
    address: 'Mr\nHello\nSomething else\nWorld'
  });
  const billsMock = [billMock1, billMock2];
  const db: IBillingDatabase = {
    articles: {
      5: articleVariant({ id: 5 }),
      6: articleVariant({ id: 6 })
    },
    billArticles: {
      3: billArticleVariant({ id: 3, billId: 1, articleId: 5 }),
      4: billArticleVariant({ id: 4, billId: 1, articleId: 6 })
    },
    bills: {
      1: billMock1,
      2: billMock2
    }
  };
  const dataStoreServiceMock: any = {
    loadData: () => undefined,
    getBillsStream: () => Observable.of(billsMock),
    status: 'loaded',
    store: () => db
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

  describe('editing bills', () => {
    it('returns a bill form when a bill is edited', () => {
      service.editBill(2).first()
        .subscribe(bill => expect(bill).toEqual(billMock2));
    });

    it('returns nothing if an invalid id is passed', () => {
      expect(service.editBill(20).count()
        .subscribe(count => expect(count).toBe(0)));
    });
  });

  describe('articles and bill articles', () => {
    it('returns the bill articles of a bill', () => {
      const billArticles = service.billArticlesForBill(billMock1);
      expect(billArticles).toEqual([db.billArticles[3], db.billArticles[4]]);
    });

    it('returns the articles of bill articles', () => {
      const billArticles = service.articlesForBillArticles([db.billArticles[3], db.billArticles[4]]);
      expect(billArticles).toEqual([db.articles[5], db.articles[6]]);
    });
  });
});
