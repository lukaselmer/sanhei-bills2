import { Bill } from './../../bill';
import { BillView } from './../../bill-view';
import { IBillMatcher } from './i-bill-matcher';

export class AmountMatcher implements IBillMatcher {
  constructor(private amount: number) { }

  matches(bill: Bill): boolean {
    const view = new BillView(bill);
    return this.isAmountAround(view.totalNet) || this.isAmountAround(view.totalGross);
  }

  private isAmountAround(target: number) {
    return this.amount - 0.51 < target && this.amount + 0.51 > target;
  }
}
