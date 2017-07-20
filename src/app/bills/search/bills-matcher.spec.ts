import { async } from '@angular/core/testing';
import { BillsService } from 'app/bills/bills.service';
import { Observable } from 'rxjs/Observable';
import { Bill } from './../bill';
import { BillMatcher } from './bill-matcher';

const bill = {
  id: 1000,
  cashback: 2000,
  uid: 3000,
  vat: 4.51,
  workHours: 5000,
  address1: 'address1',
  address2: 'address2',
  address3: 'address3',
  address4: 'address4',
  address5: 'address5',
  billType: 'billType',
  description: 'description',
  fixedAtOverride: 'fixedAtOverride',
  ordererName: 'ordererName',
  ownerName: 'ownerName',
  title1: 'title1',
  title2: 'title2',
  worker: 'worker',
  deleted: false,
  finished: false,
  paid: false,
  billedAt: new Date(2017, 5, 23).toISOString(),
  fixedAt: new Date(2017, 5, 21).toISOString(),
  orderedAt: new Date(2017, 5, 20).toISOString(),
  createdAt: new Date(2017, 5, 22).toISOString(),
  updatedAt: new Date(2017, 5, 24).toISOString()
};

function billVariant(attributes: Partial<Bill>): Bill {
  return { ...bill, ...attributes };
}

function match(term: string, potentialMatchingBill: Bill) {
  return new BillMatcher(term).matches(potentialMatchingBill);
}

describe('BillMatcherService', () => {
  it('always matches the empty string', () => {
    expect(match('', bill)).toBeTruthy();
  });

  it('ignores case and spaces', () => {
    const variant = billVariant({
      address1: 'A street',
      address2: 'Something',
      address3: 'lower'
    });
    expect(match('some', variant)).toBeTruthy();
    expect(match('a stre', variant)).toBeTruthy();
    expect(match('low', variant)).toBeTruthy();
    expect(match('bla', variant)).toBeFalsy();
  });

  it('does not search within a field', () => {
    const variant = billVariant({ address1: 'A street' });
    expect(match('street', bill)).toBeFalsy();
  });

  it('matches the beginning of the id and uid', () => {
    const variant = billVariant({ id: 7324, uid: 3324 });
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
    expect(match('worker', bill)).toBeTruthy();
  });

  it('searches in number fields', () => {
    expect(match('1000', bill)).toBeTruthy();
    expect(match('2000', bill)).toBeTruthy();
    expect(match('3000', bill)).toBeTruthy();
    expect(match('4.51', bill)).toBeTruthy();
    expect(match('5000', bill)).toBeTruthy();
    expect(match('6000', bill)).toBeFalsy();
  });

  it('searches in date fields', () => {
    expect(match('2017-06-19', bill)).toBeTruthy();
    expect(match('2017-06-20', bill)).toBeTruthy();
    expect(match('2017-06-21', bill)).toBeTruthy();
    expect(match('2017-06-22', bill)).toBeTruthy();
    expect(match('2017-06-23', bill)).toBeTruthy();
  });
});
