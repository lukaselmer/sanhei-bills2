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
      ...this.applyValuesForExistingBill()
    };
  }

  private applyValuesForExistingBill() {
    return {
      uid: this.bill.uid,
      id: this.bill.id,
      humanId: this.bill.humanId,
      finished: this.bill.finished,
      paid: this.bill.paid,
      createdAt: this.bill.createdAt,
      deletedAt: this.bill.deletedAt
    };
  }
}
