import { Bill } from '../bill';

export class BillMatcher {
  constructor(private term: string) { }

  matches(bill: Bill): boolean {
    return this.term === '' ||
      this.matchesIdOrUid(bill) ||
      this.matchesNumber(bill) ||
      this.matchesTimestamps(bill) ||
      this.matchesStringsOrDates(bill);
  }

  private matchesNumber(bill: Bill) {
    const termAsNumber = +this.term;
    if (termAsNumber.toString() !== this.term) return false;

    return bill.cashback === termAsNumber ||
      bill.vat === termAsNumber ||
      bill.discount === termAsNumber;
  }

  private matchesIdOrUid(bill: Bill) {
    return bill.id.startsWith(this.term) ||
      bill.uid.toString().startsWith(this.term) ||
      bill.humanId.toString().startsWith(this.term);
  }

  private matchesTimestamps(bill: Bill) {
    return new Date(bill.createdAt).toISOString().startsWith(this.term) ||
      new Date(bill.updatedAt).toISOString().startsWith(this.term);
  }

  private matchesStringsOrDates(bill: Bill) {
    return bill.billType.toLowerCase().startsWith(this.term) ||
      bill.fixedAtOverride.toLowerCase().startsWith(this.term) ||
      bill.ordererName.toLowerCase().startsWith(this.term) ||
      bill.ownerName.toLowerCase().startsWith(this.term) ||
      bill.title1.toLowerCase().startsWith(this.term) ||
      bill.title2.toLowerCase().startsWith(this.term) ||
      bill.billedAt.toLowerCase().startsWith(this.term) ||
      bill.fixedAt.toLowerCase().startsWith(this.term) ||
      bill.orderedAt.toLowerCase().startsWith(this.term) ||
      bill.address.toLowerCase().split('\n').some(line => line.startsWith(this.term));
  }
}
