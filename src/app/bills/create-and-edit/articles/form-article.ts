import { Article } from './../../article';

export class FormArticle {
  constructor(private readonly article?: Article) {}

  get catalogId() {
    return this.article ? this.article.catalogId : '';
  }
  get description() {
    return this.article ? this.article.description : '';
  }
  get dimension() {
    return this.article ? this.article.dimension : '';
  }
  get price() {
    return this.article ? this.article.price + '' : '';
  }
  get amount() {
    return this.article ? this.article.amount + '' : '';
  }
}
