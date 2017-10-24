import { dateForUID } from '../../shared/date-helper';
import { Bill } from './../bill';
import { EditedBill } from './../edited-bill';
import { BillFormExtractor } from './bill-form-extractor';

export class BillEditFormExtractor extends BillFormExtractor {
  constructor(formValue: any, private bill: Bill) {
    super(formValue);
  }

  extractBill(): EditedBill {
    return {
      ...this.extractStrings(),
      ...this.extractNumbers(),
      ...this.extractDates(),
      articles: this.extractArticles(),
      ...this.applyValuesForExistingBill(),
      ...this.extractIds()
    };
  }

  private applyValuesForExistingBill() {
    return {
      id: this.bill.id,
      finished: this.bill.finished,
      paid: this.bill.paid,
      createdAt: this.bill.createdAt,
      deletedAt: this.bill.deletedAt
    };
  }

  private extractIds() {
    const humanId = parseInt(this.formValue.humanId, 10);
    const uid = parseInt(`${dateForUID(this.bill.createdAt)}${humanId}`, 10);
    return { humanId, uid };
  }
}
