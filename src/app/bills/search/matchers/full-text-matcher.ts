import { Bill } from '../../bill';
import { IBillMatcher } from './i-bill-matcher';

export class FullTextMatcher implements IBillMatcher {
  constructor(private term: string) {}

  matches(bill: Bill): boolean {
    return (
      this.term === '' ||
      this.matchesIdOrUid(bill) ||
      this.matchesNumber(bill) ||
      this.matchesTimestamps(bill) ||
      this.matchesStringsOrDates(bill)
    );
  }

  private matchesNumber(bill: Bill) {
    const termAsNumber = +this.term;
    if (termAsNumber.toString() !== this.term) {
      return false;
    }

    return (
      bill.cashback === termAsNumber || bill.vat === termAsNumber || bill.discount === termAsNumber
    );
  }

  private matchesIdOrUid(bill: Bill) {
    return (
      bill.id.startsWith(this.term) ||
      bill.uid.toString().startsWith(this.term) ||
      bill.humanId.toString().startsWith(this.term)
    );
  }

  private matchesTimestamps(bill: Bill) {
    return (
      new Date(bill.createdAt).toISOString().startsWith(this.term) ||
      new Date(bill.updatedAt).toISOString().startsWith(this.term)
    );
  }

  private matchesStringsOrDates(bill: Bill) {
    return (
      bill.billType.toLowerCase().startsWith(this.term) ||
      bill.ordererName.toLowerCase().startsWith(this.term) ||
      bill.ownerName.toLowerCase().startsWith(this.term) ||
      bill.title.toLowerCase().startsWith(this.term) ||
      bill.descriptionTitle.toLowerCase().startsWith(this.term) ||
      bill.billedAt.toLowerCase().startsWith(this.term) ||
      bill.workedAt.toLowerCase().startsWith(this.term) ||
      bill.orderedAt.toLowerCase().startsWith(this.term) ||
      bill.address
        .toLowerCase()
        .split('\n')
        .some(line => line.startsWith(this.term)) ||
      this.matchesTitleParts(bill)
    );
  }

  private matchesTitleParts(bill: Bill) {
    const part1 = bill.title.toLowerCase();
    const part2 = part1.substring(part1.indexOf(' ') + 1, part1.length);
    const part3 = part2.substring(part2.indexOf(' ') + 1, part2.length);

    return part2.startsWith(this.term) || part3.startsWith(this.term);
  }
}
