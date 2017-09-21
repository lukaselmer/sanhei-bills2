import { Bill } from '../bill';

export class BillMatcher {
  constructor(private term: string) { }

  matches(bill: Bill): boolean {
    if (this.term === '') return true;

    if (this.matchesIdOrUid(bill)) return true;
    if (this.matchesNumber(bill)) return true;
    if (this.matchesTimestamps(bill)) return true;
    if (this.matchesStringsOrDates(bill)) return true;

    return false;
  }

  private matchesNumber(bill: Bill) {
    const termAsNumber = +this.term;
    if (termAsNumber.toString() !== this.term) return false;

    return bill.cashback === termAsNumber ||
      bill.vat === termAsNumber ||
      bill.workHours === termAsNumber ||
      bill.discount === termAsNumber;
  }

  private matchesIdOrUid(bill: Bill) {
    return bill.id.toString().startsWith(this.term) || bill.uid.toString().startsWith(this.term);
  }

  private matchesTimestamps(bill: Bill) {
    return bill.createdAt && new Date(bill.createdAt).toISOString().startsWith(this.term) ||
      bill.updatedAt && new Date(bill.updatedAt).toISOString().startsWith(this.term);
  }

  private matchesStringsOrDates(bill: Bill) {
    return bill.address1 && bill.address1.toLowerCase().startsWith(this.term) ||
      bill.address2 && bill.address2.toLowerCase().startsWith(this.term) ||
      bill.address3 && bill.address3.toLowerCase().startsWith(this.term) ||
      bill.address4 && bill.address4.toLowerCase().startsWith(this.term) ||
      bill.address5 && bill.address5.toLowerCase().startsWith(this.term) ||
      bill.billType && bill.billType.toLowerCase().startsWith(this.term) ||
      bill.fixedAtOverride && bill.fixedAtOverride.toLowerCase().startsWith(this.term) ||
      bill.ordererName && bill.ordererName.toLowerCase().startsWith(this.term) ||
      bill.ownerName && bill.ownerName.toLowerCase().startsWith(this.term) ||
      bill.title1 && bill.title1.toLowerCase().startsWith(this.term) ||
      bill.title2 && bill.title2.toLowerCase().startsWith(this.term) ||
      bill.worker && bill.worker.toLowerCase().startsWith(this.term) ||
      bill.billedAt && bill.billedAt.toLowerCase().startsWith(this.term) ||
      bill.fixedAt && bill.fixedAt.toLowerCase().startsWith(this.term) ||
      bill.orderedAt && bill.orderedAt.toLowerCase().startsWith(this.term);

    /**
     * This is the same as the following code. The code is inlined for performance reasons.
     * See performance tests for details.
     *
     * private pick<K extends keyof Bill>(bill: Bill, ...fields: K[]): Bill[K][] {
     *   return fields.map(field => bill[field] || '');
     * }
     *
     * private startsWithTerm(value: string): boolean {
     *   return value.toLowerCase().startsWith(this.term);
     * }
     *
     * return this.pick(bill,
     *   'address1', 'address2', 'address3', 'address4', 'address5',
     *   'billType', 'fixedAtOverride', 'ordererName', 'ownerName', 'title1', 'title2', 'worker',
     *   'billedAt', 'fixedAt', 'orderedAt', 'createdAt', 'updatedAt'
     * ).some(x => this.startsWithTerm(x));
     */
  }
}
