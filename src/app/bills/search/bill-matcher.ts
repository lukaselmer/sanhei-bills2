import { Injectable } from '@angular/core';
import { Bill } from '../bill';

export class BillMatcher {
  constructor(private term: string) { }

  matches(bill: Bill): boolean {
    if (this.term === '') return true;
    if (this.matchesNumber(bill)) return true;
    if (this.matchesIdOrUid(bill)) return true;
    if (this.matchesAddress(bill)) return true;
    if (this.matchesOtherStringFields(bill)) return true;
    if (this.matchesDates(bill)) return true;

    return false;
  }

  private matchesNumber(bill: Bill) {
    const termAsNumber = +this.term;
    if (termAsNumber.toString() !== this.term) return false;

    return bill.id === termAsNumber ||
      bill.cashback === termAsNumber ||
      bill.uid === termAsNumber ||
      bill.vat === termAsNumber ||
      bill.workHours === termAsNumber;
  }

  private matchesIdOrUid(bill: Bill) {
    return bill.id.toString().startsWith(this.term) || bill.uid.toString().startsWith(this.term);
  }

  private matchesAddress(bill: Bill) {
    return (bill.address1 && bill.address1.toLowerCase().startsWith(this.term)) ||
      (bill.address2 && bill.address2.toLowerCase().startsWith(this.term)) ||
      (bill.address3 && bill.address3.toLowerCase().startsWith(this.term)) ||
      (bill.address4 && bill.address4.toLowerCase().startsWith(this.term)) ||
      (bill.address5 && bill.address5.toLowerCase().startsWith(this.term));
  }

  private matchesOtherStringFields(bill: Bill) {
    return (bill.billType && bill.billType.toLowerCase().startsWith(this.term)) ||
      (bill.fixedAtOverride && bill.fixedAtOverride.toLowerCase().startsWith(this.term)) ||
      (bill.ordererName && bill.ordererName.toLowerCase().startsWith(this.term)) ||
      (bill.ownerName && bill.ownerName.toLowerCase().startsWith(this.term)) ||
      (bill.title1 && bill.title1.toLowerCase().startsWith(this.term)) ||
      (bill.title2 && bill.title2.toLowerCase().startsWith(this.term)) ||
      (bill.worker && bill.worker.toLowerCase().startsWith(this.term));
  }

  private matchesDates(bill: Bill) {
    return (bill.billedAt && bill.billedAt.startsWith(this.term)) ||
      (bill.fixedAt && bill.fixedAt.startsWith(this.term)) ||
      (bill.orderedAt && bill.orderedAt.startsWith(this.term)) ||
      (bill.createdAt && bill.createdAt.startsWith(this.term)) ||
      (bill.updatedAt && bill.updatedAt.startsWith(this.term));
  }
}
