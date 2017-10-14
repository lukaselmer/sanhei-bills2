import { billVariant } from '../../bill.mock';
import { Bill } from './../../bill';
import { FullTextMatcher } from './full-text-matcher';

const bill = billVariant({});

function match(term: string, potentialMatchingBill: Bill) {
  return new FullTextMatcher(term).matches(potentialMatchingBill);
}

describe('FullTextMatcher', () => {
  it('always matches the empty string', () => {
    expect(match('', bill)).toBeTruthy();
  });

  it('ignores case and spaces', () => {
    const variant = billVariant({
      address: 'A street\nSomething\nlower'
    });
    expect(match('some', variant)).toBeTruthy();
    expect(match('a stre', variant)).toBeTruthy();
    expect(match('low', variant)).toBeTruthy();
    expect(match('bla', variant)).toBeFalsy();
  });

  it('does not search within a field', () => {
    const variant = billVariant({ address: 'A street' });
    expect(match('street', bill)).toBeFalsy();
  });

  it('matches the beginning of the id and uid', () => {
    const variant = billVariant({ id: '7324', uid: 3324 });
    expect(match('7', variant)).toBeTruthy();
    expect(match('73', variant)).toBeTruthy();
    expect(match('732', variant)).toBeTruthy();
    expect(match('7324', variant)).toBeTruthy();
    expect(match('73245', variant)).toBeFalsy();
    expect(match('3', variant)).toBeTruthy();
    expect(match('33', variant)).toBeTruthy();
    expect(match('332', variant)).toBeTruthy();
    expect(match('3324', variant)).toBeTruthy();
    expect(match('33245', variant)).toBeFalsy();
  });

  it('searches in all address fields', () => {
    expect(match('address1', bill)).toBeTruthy();
    expect(match('address2', bill)).toBeTruthy();
    expect(match('address3', bill)).toBeTruthy();
    expect(match('address4', bill)).toBeTruthy();
    expect(match('address5', bill)).toBeTruthy();
  });

  it('searches in other string fields', () => {
    expect(match('billtype', bill)).toBeTruthy();
    expect(match('fixedatoverride', bill)).toBeTruthy();
    expect(match('orderername', bill)).toBeTruthy();
    expect(match('ownername', bill)).toBeTruthy();
    expect(match('title1', bill)).toBeTruthy();
    expect(match('title2', bill)).toBeTruthy();
  });

  it('searches in number fields', () => {
    expect(match('1000', bill)).toBeTruthy();
    expect(match('2.5', bill)).toBeTruthy();
    expect(match('3000', bill)).toBeTruthy();
    expect(match('4.51', bill)).toBeTruthy();
    expect(match('6000', bill)).toBeFalsy();
  });

  it('searches in date fields', () => {
    expect(match('2017-06-19', bill)).toBeTruthy();
    expect(match('2017-06-20', bill)).toBeTruthy();
    expect(match('2017-06-21', bill)).toBeTruthy();
    expect(match('2017-06-22', bill)).toBeTruthy();
    expect(match('2017-06-23', bill)).toBeTruthy();
  });

  describe('performance', () => {
    const maxTime = 280; // ms
    const numBills = 20000;

    it(`takes less than ${maxTime}ms to match ${numBills} bills`, () => {
      const start = Date.now();
      const matcher = new FullTextMatcher('address will not be found');

      for (let i = 0; i < numBills; ++i) {
        matcher.matches(bill);
      }

      const difference = Date.now() - start;
      // console.log(`It took ${(difference)}ms`);
      expect(difference).toBeLessThan(maxTime);
    });
  });
});
