import { Bill } from './bill';
import { BillArticle } from './bill-article';

const billArticle: BillArticle = {
  id: 3000,
  amount: 5,
  articleId: 2000,
  billId: 1000,

  createdAt: new Date(2017, 5, 22).getTime(),
  updatedAt: new Date(2017, 5, 24).getTime()
};

export function billArticleVariant(attributes: Partial<BillArticle> = {}): BillArticle {
  return { ...billArticle, ...attributes };
}
