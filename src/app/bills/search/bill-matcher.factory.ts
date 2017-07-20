import { Injectable } from '@angular/core';
import { Bill } from '../bill';
import { BillMatcher } from './bill-matcher';

@Injectable()
export class BillMatcherFactory {
  createBillMatcher(term: string): BillMatcher {
    return new BillMatcher(term);
  }
}
