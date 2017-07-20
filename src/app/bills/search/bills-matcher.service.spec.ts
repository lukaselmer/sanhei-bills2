import { async } from '@angular/core/testing';
import { BillsService } from 'app/bills/bills.service';
import { Observable } from 'rxjs/Observable';
import { Bill } from './../bill';
import { BillMatcherService } from './bill-matcher.service';

describe('BillMatcherService', () => {
  let service: BillMatcherService;
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

  beforeEach(() => {
    service = new BillMatcherService();
  });

  it('always matches the empty string', () => {
    expect(service.matches('', bill)).toBeTruthy();
  });

  it('ignores case and spaces', () => {
    const variant = billVariant({
      address1: 'A street',
      address2: 'Something',
      address3: 'lower'
    });
    expect(service.matches('some', variant)).toBeTruthy();
    expect(service.matches('a stre', variant)).toBeTruthy();
    expect(service.matches('low', variant)).toBeTruthy();
    expect(service.matches('bla', variant)).toBeFalsy();
  });

  it('does not search within a field', () => {
    const variant = billVariant({ address1: 'A street' });
    expect(service.matches('street', bill)).toBeFalsy();
  });

  it('matches the beginning of the id and uid', () => {
    const variant = billVariant({ id: 7324, uid: 3324 });
    expect(service.matches('7', variant)).toBeTruthy();
    expect(service.matches('73', variant)).toBeTruthy();
    expect(service.matches('732', variant)).toBeTruthy();
    expect(service.matches('7324', variant)).toBeTruthy();
    expect(service.matches('73245', variant)).toBeFalsy();
    expect(service.matches('3', variant)).toBeTruthy();
    expect(service.matches('33', variant)).toBeTruthy();
    expect(service.matches('332', variant)).toBeTruthy();
    expect(service.matches('3324', variant)).toBeTruthy();
    expect(service.matches('33245', variant)).toBeFalsy();
  });

  it('searches in all address fields', () => {
    expect(service.matches('address1', bill)).toBeTruthy();
    expect(service.matches('address2', bill)).toBeTruthy();
    expect(service.matches('address3', bill)).toBeTruthy();
    expect(service.matches('address4', bill)).toBeTruthy();
    expect(service.matches('address5', bill)).toBeTruthy();
  });

  it('searches in other string fields', () => {
    expect(service.matches('billtype', bill)).toBeTruthy();
    expect(service.matches('fixedatoverride', bill)).toBeTruthy();
    expect(service.matches('orderername', bill)).toBeTruthy();
    expect(service.matches('ownername', bill)).toBeTruthy();
    expect(service.matches('title1', bill)).toBeTruthy();
    expect(service.matches('title2', bill)).toBeTruthy();
    expect(service.matches('worker', bill)).toBeTruthy();
  });

  it('searches in number fields', () => {
    expect(service.matches('1000', bill)).toBeTruthy();
    expect(service.matches('2000', bill)).toBeTruthy();
    expect(service.matches('3000', bill)).toBeTruthy();
    expect(service.matches('4.51', bill)).toBeTruthy();
    expect(service.matches('5000', bill)).toBeTruthy();
    expect(service.matches('6000', bill)).toBeFalsy();
  });

  it('searches in date fields', () => {
    expect(service.matches('2017-06-19', bill)).toBeTruthy();
    expect(service.matches('2017-06-20', bill)).toBeTruthy();
    expect(service.matches('2017-06-21', bill)).toBeTruthy();
    expect(service.matches('2017-06-22', bill)).toBeTruthy();
    expect(service.matches('2017-06-23', bill)).toBeTruthy();
  });
});
