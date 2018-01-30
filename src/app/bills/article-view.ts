import { Article } from './article';

export class ArticleView {
  constructor(private readonly pArticle: Article) {}

  get article(): Article {
    return this.pArticle;
  }

  get totalPrice(): number {
    return this.article.price * this.article.amount;
  }
}
