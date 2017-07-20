import { Injectable } from '@angular/core';
import { Bill } from '../bill';

@Injectable()
export class BillMatcherService {
  matches(term: string, bill: Bill): boolean {
    if (term === '') return true;
    if (this.matchesAddress(term, bill)) return true;
    if (this.matchesNumber(term, bill)) return true;

    return false;
  }

  private matchesAddress(term: string, bill: Bill) {
    return (bill.address1 && bill.address1.toLowerCase().startsWith(term)) ||
      (bill.address2 && bill.address2.toLowerCase().startsWith(term)) ||
      (bill.address3 && bill.address3.toLowerCase().startsWith(term)) ||
      (bill.address4 && bill.address4.toLowerCase().startsWith(term)) ||
      (bill.address5 && bill.address5.toLowerCase().startsWith(term));
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
}
