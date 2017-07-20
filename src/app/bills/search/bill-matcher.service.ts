import { Injectable } from '@angular/core';
import { Bill } from '../bill';

@Injectable()
export class BillMatcherService {
  matches(term: string, bill: Bill): boolean {
    return ((bill.address1 && bill.address1.toLowerCase().startsWith(term)) ||
      (bill.address2 && bill.address2.toLowerCase().startsWith(term)) ||
      (bill.address3 && bill.address3.toLowerCase().startsWith(term)) ||
      (bill.address4 && bill.address4.toLowerCase().startsWith(term))) ? true : false;
  }
}
