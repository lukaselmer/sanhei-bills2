import { async } from '@angular/core/testing'
import { BillMatcherFactory } from './bill-matcher.factory'
import { AmountMatcher } from './matchers/amount-matcher'
import { FullTextMatcher } from './matchers/full-text-matcher'
import { IDMatcher } from './matchers/id-matcher'

describe('DataStoreService', () => {
  const service = new BillMatcherFactory()

  describe('BillMatcherFactory', () => {
    it('creates a full text matcher', () => {
      spyOn(service, 'createFullTextMatcher').and.callThrough()
      const instance = service.createBillMatcher({ term: 'some', limit: 10 })
      expect(instance instanceof FullTextMatcher).toBeTruthy()
      expect(service.createFullTextMatcher).toHaveBeenCalledWith('some')
    })

    it('creates an ID matcher', () => {
      spyOn(service, 'createIDTextMatcher').and.callThrough()
      const instance = service.createBillMatcher({
        term: 'id: 32523',
        limit: 10,
      })
      expect(instance instanceof IDMatcher).toBeTruthy()
      expect(service.createIDTextMatcher).toHaveBeenCalledWith(32523)
    })

    it('creates an amount matcher', () => {
      spyOn(service, 'createAmountTextMatcher').and.callThrough()
      const instance = service.createBillMatcher({
        term: 'betrag: 325.23',
        limit: 10,
      })
      expect(instance instanceof AmountMatcher).toBeTruthy()
      expect(service.createAmountTextMatcher).toHaveBeenCalledWith(325.23)
    })
  })
})
