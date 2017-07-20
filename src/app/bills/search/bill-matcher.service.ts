import { Injectable } from '@angular/core';
import { Bill } from '../bill';

@Injectable()
export class BillMatcherService {
  matches(term: string, bill: Bill): boolean {
    if (term === '') return true;
    if (this.matchesNumber(term, bill)) return true;
    if (this.matchesIdOrUid(term, bill)) return true;
    if (this.matchesAddress(term, bill)) return true;
    if (this.matchesOtherStringFields(term, bill)) return true;
    if (this.matchesDates(term, bill)) return true;

    return false;
  }

  private matchesNumber(term: string, bill: Bill) {
    const termAsNumber = +term;
    if (termAsNumber.toString() !== term) return false;

    return bill.id === termAsNumber ||
      bill.cashback === termAsNumber ||
      bill.uid === termAsNumber ||
      bill.vat === termAsNumber ||
      bill.workHours === termAsNumber;
  }

  private matchesIdOrUid(term: string, bill: Bill) {
    return bill.id.toString().startsWith(term) || bill.uid.toString().startsWith(term);
  }

  private matchesAddress(term: string, bill: Bill) {
    return (bill.address1 && bill.address1.toLowerCase().startsWith(term)) ||
      (bill.address2 && bill.address2.toLowerCase().startsWith(term)) ||
      (bill.address3 && bill.address3.toLowerCase().startsWith(term)) ||
      (bill.address4 && bill.address4.toLowerCase().startsWith(term)) ||
      (bill.address5 && bill.address5.toLowerCase().startsWith(term));
  }

  private matchesOtherStringFields(term: string, bill: Bill) {
    return (bill.billType && bill.billType.toLowerCase().startsWith(term)) ||
      (bill.fixedAtOverride && bill.fixedAtOverride.toLowerCase().startsWith(term)) ||
      (bill.ordererName && bill.ordererName.toLowerCase().startsWith(term)) ||
      (bill.ownerName && bill.ownerName.toLowerCase().startsWith(term)) ||
      (bill.title1 && bill.title1.toLowerCase().startsWith(term)) ||
      (bill.title2 && bill.title2.toLowerCase().startsWith(term)) ||
      (bill.worker && bill.worker.toLowerCase().startsWith(term));
  }

  private matchesDates(term: string, bill: Bill) {
    return (bill.billedAt && bill.billedAt.startsWith(term)) ||
      (bill.fixedAt && bill.fixedAt.startsWith(term)) ||
      (bill.orderedAt && bill.orderedAt.startsWith(term)) ||
      (bill.createdAt && bill.createdAt.startsWith(term)) ||
      (bill.updatedAt && bill.updatedAt.startsWith(term));
  }
}
