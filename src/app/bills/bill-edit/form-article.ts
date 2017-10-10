import { Article } from './../article';

export class FormArticle {
  catalogId = '';
  description = '';
  dimension = '';
  price = '';
  amount = '';

  constructor(article?: Article) {
    if (!article) return;

    this.catalogId = article.catalogId;
    this.description = article.description;
    this.dimension = article.dimension;
    this.price = `${article.price}`;
    this.amount = `${article.amount}`;
  }
}
