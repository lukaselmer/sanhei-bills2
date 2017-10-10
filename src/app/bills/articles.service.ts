import { Injectable } from '@angular/core';
import { Article } from './article';
import { Bill } from './bill';
import { BillArticle } from './bill-article';
import { CombinedBillArticle } from './combined-bill-article';
import { DataStoreService } from './store/data-store.service';

@Injectable()
export class ArticlesService {
  constructor(private dataStore: DataStoreService) {
    this.dataStore.loadData();
  }

  billArticlesForBillId(billId: string) {
    const store = this.dataStore.store();
    return Object.keys(store.billArticles)
      .filter(key => store.billArticles[key].billId === billId)
      .map(key => store.billArticles[key]);
  }

  articlesForBillArticles(billArticles: BillArticle[]): Article[] {
    const store = this.dataStore.store();
    return billArticles.map(billArticle => store.articles[billArticle.articleId]);
  }

  combinedBillArticlesForBillId(billId: string): CombinedBillArticle[] {
    const store = this.dataStore.store();
    return this.billArticlesForBillId(billId).map(billArticle => {
      const article = store.articles[billArticle.articleId];
      return new CombinedBillArticle(article, billArticle);
    });
  }

    // TODO: store / update / delete articles and bill articles
  async updateArticles(billId: string, updatedArticles: CombinedBillArticle[]) {
  }
}
