import { Article } from './article';
import { BillArticle } from './bill-article';

export class CombinedBillArticle {
  catalogId = '';
  description = '';
  dimension = '';
  price = '';
  amount = '';

  constructor(public article?: Article, public billArticle?: BillArticle) {
    if (article) {
      this.catalogId = article.catalogId;
      this.description = article.description;
      this.dimension = article.dimension;
      this.price = `${article.price}`;
    }
    if (billArticle) this.amount = `${billArticle.amount}`;
  }
}
