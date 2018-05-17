import * as firebase from 'firebase/app';
import { dateOrEmpty } from '../../shared/date-helper';
import { Article } from '../article';
import { Bill, billDefaults } from '../bill';
import { EditedBill } from './../edited-bill';
import { NewBill } from './../new-bill';
import { FormArticle } from './articles/form-article';

export abstract class BillFormExtractor {
  constructor(protected formValue: any) {}

  protected extractArticles(): Article[] {
    const rawArticles: FormArticle[] = this.formValue.articles;
    return rawArticles
      .filter(article =>
        [article.description, article.price, article.amount].every(
          fieldValue => fieldValue.trim() !== ''
        )
      )
      .map(article => {
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
      discount: parseFloat(v.discount),
      ...this.extractPaymentDeadline()
    };
  }

  private extractPaymentDeadline() {
    const days = parseInt(this.formValue.paymentDeadlineInDays, 10);
    return days === billDefaults.paymentDeadlineInDays ? {} : { paymentDeadlineInDays: days };
  }

  protected extractDates() {
    const v = this.formValue;
    return {
      orderedAt: dateOrEmpty(v.orderedAt.trim()),
      billedAt: dateOrEmpty(v.billedAt.trim()),
      ...this.extractworkedAt()
    };
  }

  private extractworkedAt() {
    return {
      workedAt: this.formValue.workedAt.trim()
    };
  }
}
