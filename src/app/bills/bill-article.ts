export class BillArticle {
  id: number;
  amount: number;
  articleId: number;
  billId: number;

  // datetime format: 2010-04-23 14:35:57 UTC
  createdAt: string;
  updatedAt: string;
}
