import { Injectable } from '@angular/core';
import { Bill } from '../bill';
import { FullTextMatcher } from './matchers/full-text-matcher';
import { IBillMatcher } from './matchers/i-bill-matcher';
import { SearchOptions } from './search-options';

@Injectable()
export class BillMatcherFactory {
  createBillMatcher(options: SearchOptions): IBillMatcher {
    return this.createFullTextMatcher(options.term);
  }

  createFullTextMatcher(term: string) {
    return new FullTextMatcher(term);
  }
}
