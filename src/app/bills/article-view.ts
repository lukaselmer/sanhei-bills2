import { isGap } from 'app/bills/isGap'
import { Article } from './article'

export class ArticleView {
  constructor(private readonly pArticle: Article) {}

  get article(): Article {
    return this.pArticle
  }

  get totalPrice(): number {
    return this.isGap ? 0 : this.article.price * this.article.amount
  }

  get isGap(): boolean {
    return isGap(this.article.description)
  }

  get gap(): number {
    return this.isGap ? this.article.amount * 10 : 0
  }
}
