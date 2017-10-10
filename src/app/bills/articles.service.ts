import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Article } from './article';
import { Bill } from './bill';
import { BillArticle } from './bill-article';
import { CombinedBillArticle } from './combined-bill-article';
import { CombinedBillArticlesChangesExtractor } from './combined-bill-articles-changes-extractor';
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

  async updateArticles(billId: string, updatedArticles: CombinedBillArticle[]) {
    const store = this.dataStore.store();
    const existingArticles = this.combinedBillArticlesForBillId(billId);
    const articlesList = Object.keys(store.articles).map(key => store.articles[key]);
    const billArticlesList = Object.keys(store.billArticles).map(key => store.billArticles[key]);
    const service = new CombinedBillArticlesChangesExtractor(
      updatedArticles, existingArticles, articlesList, billArticlesList);
    service.processUpdatedArticles();

    for (const article of service.articlesToChangeAmount) {
      const ba = article.billArticle as BillArticle;
      ba.amount = parseFloat(article.amount);
      await this.dataStore.updateBillArticle(ba);
    }

    for (const article of service.articlesToChangeArticleId) {
      const ba = article.billArticle as BillArticle;
      ba.articleId = (article.article as Article).id as string;
      await this.dataStore.updateBillArticle(ba);
    }

    for (const billArticle of service.articlesToDelete) {
      await this.dataStore.deleteBillArticle(billArticle);
    }

    for (const combinedArticle of service.articlesToCreate) {
      if (!combinedArticle.article) combinedArticle.article = await this.dataStore.createArticle(this.buildArticle(combinedArticle));
      await this.dataStore.createBillArticle(this.buildBillArticle(billId, combinedArticle));
    }

    for (const combinedArticle of service.articlesToChange) {
      if (!combinedArticle.article) combinedArticle.article = await this.dataStore.createArticle(this.buildArticle(combinedArticle));
      const billArticle = combinedArticle.billArticle as BillArticle;
      billArticle.articleId = combinedArticle.article.id;
      billArticle.createdAt = firebase.database.ServerValue.TIMESTAMP as number;
      billArticle.amount = parseFloat(combinedArticle.amount);
      await this.dataStore.updateBillArticle(billArticle);
    }

    for (const article of service.definitiveArticleDeletions) {
      // TODO: check if articles are still needed. If not, delete them.
    }
  }

  private buildArticle(combinedArticle: CombinedBillArticle): Article {
    return {
      id: '',
      catalogId: combinedArticle.catalogId,
      description: combinedArticle.description,
      dimension: combinedArticle.dimension,
      price: parseFloat(combinedArticle.price),
      inCatalog: true,
      createdAt: 0, updatedAt: 0, deletedAt: undefined
    };
  }

  private buildBillArticle(billId: string, combinedArticle: CombinedBillArticle): BillArticle {
    return {
      id: '',
      amount: parseFloat(combinedArticle.amount),
      articleId: (combinedArticle.article as Article).id as string,
      billId,
      createdAt: 0, updatedAt: 0, deletedAt: undefined
    };
  }

  // const unhandledUpdatedArticles = this.ignoreSameArticles(updatedArticles, existingArticles);
  /*
    Bad idea...?
    1) delete existing bill_articles
      - actually: do not delete them, but prepare them to be recycled or deleted
      - if there are not enough recycled bill_articles
        - create new bill_articles, so that there are enough
      - if there are too many existing bill_articles
        - delete the ones which are too many (really delete them)
      result:
        - array with bill_articles which match the updatedArticles count
        - excess bill_articles are marked as deleted
    2) for every existing article:
      - if the article is used in multiple bills
        - forget the article (maybe store it in a cache to find it quicker in step 3)
      - otherwise: delete article
        - actually: do not delete them, but prepare them to be recycled
    3) for every updated article:
      - search for existing article in the store (or cached list, see step 2)
        - if found
          - use existing article
          - search in bill_articles array if the ID to the new article can be found
          - if found
            - if different amount amount
              - change amount & updatedAt
            - remove it from bill_articles array
          - else:
            - grab first free bill_article (ideally: articleID is not set)
            - change ID to new article, change amount & updatedAt
        - otherwise: we need a new article
          - if there are articles which can be recycled: use existing one
          - else: create new one
      -

  */

  // updatedArticles.map(newArticle => {
  //   if (existingArticles.some(existingArticle => this.areArticlesEqual(newArticle, existingArticle))) {

  //     return ['existing', newArticle];
  //   }

  //   // existingArticles.forEach(existingArticle => {
  //   //   if (this.areArticlesEqual(newArticle, existingArticle)) {
  //   //     newArticle.article = existingArticle.article;
  //   //     newArticle.billArticle = existingArticle.billArticle;
  //   //   }
  //   // });
  // });

  // TODO: store / update / delete articles and bill articles
  // }
}
