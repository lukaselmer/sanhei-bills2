import { Injectable } from '@angular/core';
import { Bill } from '../bill';
import { FullTextMatcher } from './matchers/full-text-matcher';
import { IBillMatcher } from './matchers/i-bill-matcher';
import { IDMatcher } from './matchers/id-matcher';
import { SearchOptions } from './search-options';

@Injectable()
export class BillMatcherFactory {
  createBillMatcher(options: SearchOptions): IBillMatcher {
    const term = options.term;

    if (term.startsWith('id:')) {
      const id = parseInt(term.split(':')[1].trim(), 10);
      return this.createIDTextMatcher(id);
    }

    return this.createFullTextMatcher(term);
  }

  createIDTextMatcher(id: number) {
    return new IDMatcher(id);
  }

  createFullTextMatcher(term: string) {
    return new FullTextMatcher(term);
  }
}
