import { async } from '@angular/core/testing';
import { BillMatcherFactory } from './bill-matcher.factory';
import { FullTextMatcher } from './matchers/full-text-matcher';

describe('DataStoreService', () => {
  const service = new BillMatcherFactory();

  describe('BillMatcherFactory', () => {
    it('creates a full text matcher', () => {
      spyOn(service, 'createFullTextMatcher').and.callThrough();
      const instance = service.createBillMatcher({ term: 'some', limit: 10 });
      expect(instance instanceof FullTextMatcher).toBeTruthy();
      expect(service.createFullTextMatcher).toHaveBeenCalledWith('some');
    });
  });
});
