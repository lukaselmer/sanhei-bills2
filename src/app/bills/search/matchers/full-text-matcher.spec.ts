import { billVariant } from '../../bill.mock';
import { Bill } from './../../bill';
import { FullTextMatcher } from './full-text-matcher';

const bill = billVariant({
  humanId: 1000,
  uid: 3000
});

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
    const variant = billVariant({
      address: 'A street'
    });
    expect(match('street', bill)).toBeFalsy();
  });

  it('matches the beginning of the id and uid', () => {
    const variant = billVariant({
      id: '7324',
      uid: 3324
    });
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
    expect(match('orderername', bill)).toBeTruthy();
    expect(match('ownername', bill)).toBeTruthy();
    expect(match('title', bill)).toBeTruthy();
    expect(match('descriptiontitle', bill)).toBeTruthy();
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

  it('searches in the first 3 words of the bill title', () => {
    const variant = billVariant({ title: 'Objekt: MFH Examplestreet 5, 8044 Zürich' });
    expect(match('objekt: mfh examplestreet 5, 8044 zürich', variant)).toBeTruthy();
    expect(match('objekt:', variant)).toBeTruthy();
    expect(match('mfh', variant)).toBeTruthy();
    expect(match('mfh examplestreet', variant)).toBeTruthy();
    expect(match('mfh examplestreet 5, 8044 zürich', variant)).toBeTruthy();
    expect(match('example', variant)).toBeTruthy();
    expect(match('examplestreet 5', variant)).toBeTruthy();
    expect(match('examplestreet 5, 8044 zürich', variant)).toBeTruthy();

    const shorter = billVariant({ title: 'Objekt: Examplestreet' });
    expect(match('objekt:', shorter)).toBeTruthy();
    expect(match('examplestreet', shorter)).toBeTruthy();
    expect(match('doesnotexist', shorter)).toBeFalsy();

    const short = billVariant({ title: 'Objekt' });
    expect(match('objekt', short)).toBeTruthy();
    expect(match('examplestreet', short)).toBeFalsy();
    expect(match('doesnotexist', short)).toBeFalsy();
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
