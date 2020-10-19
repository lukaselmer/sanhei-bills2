import { stringToDate } from '../shared/date-helper'
import { AddressView } from './address-view'
import { Article } from './article'
import { ArticleView } from './article-view'
import { Bill, billDefaults } from './bill'

export class BillView {
  private readonly pBillArticleViews: ArticleView[]

  constructor(private readonly bill: Bill) {
    this.pBillArticleViews = bill.articles.map((article) => new ArticleView(article))
  }

  get id() {
    return this.bill.id
  }
  get humanId() {
    return this.bill.humanId
  }
  get cashback() {
    return this.bill.cashback
  }
  get uid() {
    return this.bill.uid
  }
  get vat() {
    return this.bill.vat
  }
  get discount() {
    return this.bill.discount
  }
  get paymentDeadlineInDays() {
    return this.bill.paymentDeadlineInDays || billDefaults.paymentDeadlineInDays
  }

  // means finished editing
  get finished() {
    return this.bill.finished
  }
  get paid() {
    return this.bill.paid
  }
  get deleted() {
    return !!this.bill.deletedAt
  }

  get billType() {
    return this.bill.billType
  }
  get description() {
    return this.bill.description
  }
  get descriptionParagraphs() {
    return this.bill.description.split('\n')
  }
  get ordererName() {
    return this.bill.ordererName
  }
  get ownerName() {
    return this.bill.ownerName
  }
  get title() {
    return this.bill.title
  }
  get descriptionTitle() {
    return this.bill.descriptionTitle
  }

  get workedAt() {
    return this.bill.workedAt
  }
  get orderedAt() {
    return this.bill.orderedAt
  }
  get billedAt() {
    return this.bill.billedAt
  }

  get addressView() {
    return new AddressView(this.bill.address)
  }
  get articles() {
    return this.pBillArticleViews
  }

  get totalNet() {
    return this.articles.map((bav) => bav.totalPrice).reduce((sum, el) => sum + el, 0)
  }
  get totalDiscount() {
    return Math.round((20 * this.totalNet * this.discount) / 100) / 20
  }
  get totalAfterDiscount() {
    return this.totalNet - this.totalDiscount
  }
  get totalCashback() {
    return Math.round((20 * this.totalAfterDiscount * this.cashback) / 100) / 20
  }
  get totalAfterCashback() {
    return this.totalAfterDiscount - this.totalCashback
  }
  get totalVat() {
    return Math.round((20 * this.totalAfterCashback * this.vat) / 100) / 20
  }
  get totalGross() {
    const undroundedTotal = this.totalNet - this.totalDiscount - this.totalCashback + this.totalVat
    return Math.round(20 * undroundedTotal) / 20
  }

  get billedAtDate() {
    if (!this.bill.billedAt) return
    return stringToDate(this.bill.billedAt)
  }
}
