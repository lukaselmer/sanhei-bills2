import { Article } from './article';
import { Bill } from './bill';
import { BillArticle } from './bill-article';
import { BillArticleView } from './bill-article-view';

export class BillView {
  private pBillArticleViews: BillArticleView[];

  constructor(private bill: Bill, billArticles: BillArticle[], articles: Article[]) {
    this.pBillArticleViews = billArticles.map(billArticle => {
      const article = articles.find(a => a.id === billArticle.articleId);
      return article ? new BillArticleView(billArticle, article) : undefined;
    }).filter(bav => bav) as BillArticleView[];
  }

  get id() { return this.bill.id; }
  get cashback() { return this.bill.cashback; }
  get uid() { return this.bill.uid; }
  get vat() { return this.bill.vat; }
  get discount() { return this.bill.discount; }

  get finished() { return this.bill.finished; } // means finished editing
  get paid() { return this.bill.paid; }
  get deleted() { return !!this.bill.deletedAt; }

  get address() { return this.bill.address; }

  get addressLines() {
    return this.bill.address.split('\n').filter(line => line);
  }

  get commaSeparatedAddress() {
    return this.addressLines.join(', ');
  }

  get billType() { return this.bill.billType; }
  get description() { return this.bill.description; }
  get fixedAtOverride() { return this.bill.fixedAtOverride; }
  get ordererName() { return this.bill.ordererName; }
  get ownerName() { return this.bill.ownerName; }
  get title1() { return this.bill.title1; }
  get title2() { return this.bill.title2; }

  get fixedAt() { return this.bill.fixedAt; }
  get orderedAt() { return this.bill.orderedAt; }
  get billedAt() { return this.bill.billedAt; }

  get billArticleViews() { return this.pBillArticleViews; }

  get totalNet() {
    return this.billArticleViews
      .map(bav => bav.totalPrice)
      .reduce((sum, el) => sum + el, 0);
  }

  get totalDiscount() { return Math.round(20 * this.totalNet * this.discount / 100) / 20; }
  get totalCashback() { return Math.round(20 * this.totalNet * this.cashback / 100) / 20; }
  get totalVat() { return Math.round(20 * this.totalNet * this.vat / 100) / 20; }
  get totalGross() {
    const undroundedTotal = this.totalNet - this.totalDiscount - this.totalCashback + this.totalVat;
    return Math.round(20 * undroundedTotal) / 20;
  }

  // date format: '' or 2017-05-30
  // get fixedAtDate() { return this.stringToDate(this.bill.fixedAt); }
  // get orderedAtDate() { return this.stringToDate(this.bill.orderedAt); }
  // get billedAtDate() { return this.stringToDate(this.bill.billedAt); }
  // private stringToDate(str: string) { return str ? new Date(...str.split('-')) : null; }
  // datetime format: '' or 2010-04-23 14:35:57 UTC
  // get createdAt() { return this.bill.createdAt ? new Date(this.bill.createdAt) : null; }
  // get updatedAt() { return this.bill.updatedAt ? new Date(this.bill.updatedAt) : null; }
}
