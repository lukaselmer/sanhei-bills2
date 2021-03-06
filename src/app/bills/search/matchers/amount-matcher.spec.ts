import { billVariant } from '../../bill.mock'
import { Bill } from './../../bill'
import { AmountMatcher } from './amount-matcher'

const bill = billVariant({})

function match(id: number, potentialMatchingBill: Bill) {
  return new AmountMatcher(id).matches(potentialMatchingBill)
}

describe('AmountMatcher', () => {
  it('matches the net amount', () => {
    expect(match(5 * 150, billVariant())).toBeTruthy()
    expect(match(5 * 150 + 0.5, billVariant())).toBeTruthy()
    expect(match(5 * 150 - 0.5, billVariant())).toBeTruthy()
    expect(match(5 * 150 + 1, billVariant())).toBeFalsy()
    expect(match(5 * 150 - 1, billVariant())).toBeFalsy()
  })

  it('matches the gross amount', () => {
    expect(match(733.65, billVariant())).toBeTruthy()
    expect(match(733.65 + 0.5, billVariant())).toBeTruthy()
    expect(match(733.65 - 0.5, billVariant())).toBeTruthy()
    expect(match(733.65 + 1, billVariant())).toBeFalsy()
    expect(match(733.65 - 1, billVariant())).toBeFalsy()
  })
})
