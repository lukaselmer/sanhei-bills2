import { Injectable } from '@angular/core';
import { Bill } from '../bill';

export class BillMatcher {
  constructor(private term: string) { }

  matches(bill: Bill): boolean {
    if (this.term === '') return true;

    if (this.matchesIdOrUid(bill)) return true;
    if (this.matchesNumber(bill)) return true;
    if (this.matchesStringsOrDates(bill)) return true;

    return false;
  }

  private matchesNumber(bill: Bill) {
    const termAsNumber = +this.term;
    if (termAsNumber.toString() !== this.term) return false;

    return bill.cashback === termAsNumber ||
      bill.vat === termAsNumber ||
      bill.workHours === termAsNumber;
  }

  private matchesIdOrUid(bill: Bill) {
    return bill.id.toString().startsWith(this.term) || bill.uid.toString().startsWith(this.term);
  }

  private matchesStringsOrDates(bill: Bill) {
    return bill.address1.toLowerCase().startsWith(this.term) ||
      bill.address2.toLowerCase().startsWith(this.term) ||
      bill.address3.toLowerCase().startsWith(this.term) ||
      bill.address4.toLowerCase().startsWith(this.term) ||
      bill.address5.toLowerCase().startsWith(this.term) ||
      bill.billType.toLowerCase().startsWith(this.term) ||
      bill.fixedAtOverride.toLowerCase().startsWith(this.term) ||
      bill.ordererName.toLowerCase().startsWith(this.term) ||
      bill.ownerName.toLowerCase().startsWith(this.term) ||
      bill.title1.toLowerCase().startsWith(this.term) ||
      bill.title2.toLowerCase().startsWith(this.term) ||
      bill.worker.toLowerCase().startsWith(this.term) ||
      bill.billedAt.toLowerCase().startsWith(this.term) ||
      bill.fixedAt.toLowerCase().startsWith(this.term) ||
      bill.orderedAt.toLowerCase().startsWith(this.term) ||
      bill.createdAt.toLowerCase().startsWith(this.term) ||
      bill.updatedAt.toLowerCase().startsWith(this.term);

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
