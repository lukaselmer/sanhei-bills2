import { Article } from './article';
import { BillArticle } from './bill-article';

export class BillArticleView {
  constructor(private pBillArticle: BillArticle, private pArticle: Article) { }
  get billArticle(): BillArticle { return this.pBillArticle; }
  get article(): Article { return this.pArticle; }
}
