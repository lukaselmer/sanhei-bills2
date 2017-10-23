import * as firebase from 'firebase/app';
import { Article } from '../article';
import { Bill } from '../bill';
import { EditedBill } from './../edited-bill';
import { NewBill } from './../new-bill';
import { FormArticle } from './form-article';

export abstract class BillFormExtractor {
  constructor(protected formValue: any) { }

  protected extractArticles(): Article[] {
    const rawArticles: FormArticle[] = this.formValue.articles;
    return rawArticles.filter(article =>
      [article.description, article.price, article.amount]
        .every(fieldValue => fieldValue.trim() !== '')
    ).map(article => {
      return {
        amount: parseFloat(article.amount),
        price: parseFloat(article.price),
        description: article.description.trim(),
        dimension: article.dimension.trim(),
        catalogId: article.catalogId.trim()
      };
    });
  }

  protected extractStrings() {
    const v = this.formValue;
    return {
      address: v.address.trim(),
      billType: v.billType.trim(),
      description: v.description.trim(),
      ordererName: v.ordererName.trim(),
      ownerName: v.ownerName.trim(),
      title: v.title.trim(),
      descriptionTitle: v.descriptionTitle.trim()
    };
  }

  protected extractNumbers() {
    const v = this.formValue;
    return {
      cashback: parseFloat(v.cashback),
      vat: parseFloat(v.vat),
      discount: parseFloat(v.discount)
    };
  }

  protected extractDates() {
    const v = this.formValue;
    return {
      orderedAt: this.dateOrEmpty(v.orderedAt),
      billedAt: this.dateOrEmpty(v.billedAt),
      ...this.extractworkedAt()
    };
  }

  private dateOrEmpty(potentialDate: string) {
    const dateRegexp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    return (potentialDate || '').match(dateRegexp) ? potentialDate : '';
  }

  private extractworkedAt() {
    return { workedAt: this.formValue.workedAt.trim() };
  }
}
