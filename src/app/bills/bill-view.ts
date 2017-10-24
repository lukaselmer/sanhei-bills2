import { Article } from './article';
import { ArticleView } from './article-view';
import { Bill } from './bill';

export class BillView {
  private pBillArticleViews: ArticleView[];

  constructor(private bill: Bill) {
    this.pBillArticleViews = bill.articles.map(article =>
      new ArticleView(article)
    );
  }

  get id() { return this.bill.id; }
  get humanId() { return this.bill.humanId; }
  get cashback() { return this.bill.cashback; }
  get uid() { return this.bill.uid; }
  get vat() { return this.bill.vat; }
  get discount() { return this.bill.discount; }
  get paymentDeadlineInDays() { return this.bill.paymentDeadlineInDays || Bill.DEFAULTS.paymentDeadlineInDays; }

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
  get ordererName() { return this.bill.ordererName; }
  get ownerName() { return this.bill.ownerName; }
  get title() { return this.bill.title; }
  get descriptionTitle() { return this.bill.descriptionTitle; }

  get workedAt() { return this.bill.workedAt; }
  get orderedAt() { return this.bill.orderedAt; }
  get billedAt() { return this.bill.billedAt; }

  get articles() { return this.pBillArticleViews; }

  get totalNet() {
    return this.articles
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
  // get workedAtDate() { return this.stringToDate(this.bill.workedAt); }
  // get orderedAtDate() { return this.stringToDate(this.bill.orderedAt); }
  // get billedAtDate() { return this.stringToDate(this.bill.billedAt); }
  // private stringToDate(str: string) { return str ? new Date(...str.split('-')) : null; }
  // datetime format: '' or 2010-04-23 14:35:57 UTC
  // get createdAt() { return this.bill.createdAt ? new Date(this.bill.createdAt) : null; }
  // get updatedAt() { return this.bill.updatedAt ? new Date(this.bill.updatedAt) : null; }
}
