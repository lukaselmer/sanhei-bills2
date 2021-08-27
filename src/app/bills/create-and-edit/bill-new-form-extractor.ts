import { NewBill } from './../new-bill'
import { BillFormExtractor } from './bill-form-extractor'

export class BillNewFormExtractor extends BillFormExtractor {
  extractBill(): NewBill {
    const bill = {
      ...this.extractStrings(),
      ...this.extractNumbers(),
      ...this.extractDates(),
      articles: this.extractArticles(),
      ...this.applyValuesForNewBill(),
    }
    return bill
  }

  private applyValuesForNewBill() {
    return { finished: false, paid: false } as const
  }
}
