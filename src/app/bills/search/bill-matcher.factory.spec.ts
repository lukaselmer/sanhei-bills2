import { async } from '@angular/core/testing';
import { BillMatcherFactory } from './bill-matcher.factory';
import { FullTextMatcher } from './matchers/full-text-matcher';
import { IDMatcher } from './matchers/id-matcher';

describe('DataStoreService', () => {
  const service = new BillMatcherFactory();

  describe('BillMatcherFactory', () => {
    it('creates a full text matcher', () => {
      spyOn(service, 'createFullTextMatcher').and.callThrough();
      const instance = service.createBillMatcher({ term: 'some', limit: 10 });
      expect(instance instanceof FullTextMatcher).toBeTruthy();
      expect(service.createFullTextMatcher).toHaveBeenCalledWith('some');
    });

    it('creates an ID matcher', () => {
      spyOn(service, 'createIDTextMatcher').and.callThrough();
      const instance = service.createBillMatcher({ term: 'id: 32523', limit: 10 });
      expect(instance instanceof IDMatcher).toBeTruthy();
      expect(service.createIDTextMatcher).toHaveBeenCalledWith(32523);
    });
  });
});
