import { Bill } from './../../bill';
import { IBillMatcher } from './i-bill-matcher';

export class IDMatcher implements IBillMatcher {
  constructor(private id: number) { }

  matches(bill: Bill): boolean {
    return bill.humanId === this.id || bill.uid === this.id;
  }
}
