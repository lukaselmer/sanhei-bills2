import { Bill } from './../bill';
import { EditedBill } from './../edited-bill';
import { NewBill } from './../new-bill';
import { BillFormExtractor } from './bill-form-extractor';

export class BillNewFormExtractor extends BillFormExtractor {
  extractBill(): NewBill {
    return {
      ...this.extractStrings(),
      ...this.extractNumbers(),
      ...this.extractDates(),
      articles: this.extractArticles(),
      ...this.applyValuesForNewBill()
    };
  }

  private applyValuesForNewBill() {
    return {
      finished: false as false,
      paid: false as false
    };
  }
}
