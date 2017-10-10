import * as firebase from 'firebase/app';
import { Article } from '../article';
import { Bill } from '../bill';
import { FormArticle } from './form-article';

export class BillFormExtractor {
  constructor(private bill: Bill, private formValue: any) { }

  extractBill(): Bill {
    return {
      ...this.extractStrings(),
      ...this.extractNumbers(),
      ...this.applyExistingValuesFromBill(),
      ...this.extractDates(),
      ...this.setTimestamps(),
      articles: this.extractArticles()
    };
  }

  private extractArticles(): Article[] {
    const rawArticles: FormArticle[] = this.formValue.articles;
    return rawArticles.filter(article =>
      [article.description, article.price, article.amount]
        .every(fieldValue => fieldValue.trim() !== '')
    ).map(article => {
      return {
        amount: parseFloat(article.amount),
        price: parseFloat(article.price),
        description: article.description,
        dimension: article.dimension,
        catalogId: article.catalogId
      };
    });
  }

  private extractStrings() {
    const v = this.formValue;
    return {
      address: v.address.trim(),
      billType: v.billType,
      description: v.description,
      ordererName: v.ordererName,
      ownerName: v.ownerName,
      title1: v.title1,
      title2: v.title2
    };
  }

  private extractNumbers() {
    const v = this.formValue;
    return {
      cashback: parseFloat(v.cashback),
      vat: parseFloat(v.vat),
      discount: parseFloat(v.discount)
    };
  }

  private applyExistingValuesFromBill() {
    return {
      uid: this.bill.uid,
      id: this.bill.id,
      humanId: this.bill.humanId,
      finished: this.bill.finished,
      paid: this.bill.paid,
      deletedAt: this.bill.deletedAt
    };
  }

  private extractDates() {
    const v = this.formValue;
    return {
      orderedAt: this.dateOrEmpty(v.orderedAt),
      billedAt: this.dateOrEmpty(v.billedAt),
      ...this.extractFixedAt()
    };
  }

  private dateOrEmpty(potentialDate: string) {
    const dateRegexp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    return (potentialDate || '').match(dateRegexp) ? potentialDate : '';
  }

  private extractFixedAt() {
    const fixedAtDescription: string = this.formValue.fixedAtDescription.trim();
    if (this.dateOrEmpty(fixedAtDescription) === '') {
      return { fixedAt: '', fixedAtOverride: fixedAtDescription };
    }
    return { fixedAt: fixedAtDescription, fixedAtOverride: '' };
  }

  private setTimestamps() {
    return {
      createdAt: this.bill.createdAt,
      updatedAt: firebase.database.ServerValue.TIMESTAMP as number
    };
  }
}
