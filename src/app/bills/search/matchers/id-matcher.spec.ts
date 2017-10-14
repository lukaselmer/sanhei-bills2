import { billVariant } from '../../bill.mock';
import { Bill } from './../../bill';
import { IDMatcher } from './id-matcher';

const bill = billVariant({});

function match(id: number, potentialMatchingBill: Bill) {
  return new IDMatcher(id).matches(potentialMatchingBill);
}

describe('IDMatcher', () => {
  it('matches the human id exactly', () => {
    expect(match(42, billVariant({ humanId: 42 }))).toBeTruthy();
    expect(match(43, billVariant({ humanId: 42 }))).toBeFalsy();
    expect(match(422, billVariant({ humanId: 42 }))).toBeFalsy();
  });

  it('matches the uid id exactly', () => {
    expect(match(170142, billVariant({ uid: 170142 }))).toBeTruthy();
    expect(match(170143, billVariant({ uid: 170142 }))).toBeFalsy();
    expect(match(1701422, billVariant({ uid: 170142 }))).toBeFalsy();
  });
});
