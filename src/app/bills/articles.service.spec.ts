import { async } from '@angular/core/testing';
import 'rxjs/add/operator/count';
import { Observable } from 'rxjs/Observable';
import { articleVariant } from './article.mock';
import { ArticlesService } from './articles.service';
import { billArticleVariant } from './bill-article.mock';
import { billVariant } from './bill.mock';
import { CombinedBillArticle } from './combined-bill-article';
import { BillMatcherFactory } from './search/bill-matcher.factory';
import { IBillingDatabase } from './store/billing-database';

describe('BillsService', () => {
  let service: ArticlesService;
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
    service = new ArticlesService(dataStoreServiceMock);
  });

  describe('articles and bill articles', () => {
    it('returns the bill articles of a bill', () => {
      const billArticles = service.billArticlesForBillId(billMock1.id);
      expect(billArticles).toEqual([db.billArticles[3], db.billArticles[4]]);
    });

    it('returns the articles of bill articles', () => {
      const billArticles = service.articlesForBillArticles([db.billArticles[3], db.billArticles[4]]);
      expect(billArticles).toEqual([db.articles[5], db.articles[6]]);
    });

    it('returns the combined bill articles of a bill', () => {
      expect(service.combinedBillArticlesForBillId(billMock1.id)).toEqual([
        new CombinedBillArticle(db.articles[5], db.billArticles[3]),
        new CombinedBillArticle(db.articles[6], db.billArticles[4])
      ]);
    });
  });

  describe('update', () => {
    it('deletes existing bill articles', () => {
      service.updateArticles(billMock1.id, [
        new CombinedBillArticle(db.articles[5], db.billArticles[3])
      ]);
      expect(service.billArticlesForBillId(billMock1.id)).toEqual([db.billArticles[3]]);
    });
  });
});
