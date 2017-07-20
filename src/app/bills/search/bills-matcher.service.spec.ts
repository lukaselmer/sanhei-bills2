import { async } from '@angular/core/testing';
import { BillsService } from 'app/bills/bills.service';
import { Observable } from 'rxjs/Observable';
import { Bill } from './../bill';
import { BillMatcherService } from './bill-matcher.service';

describe('BillMatcherService', () => {
  let service: BillMatcherService;
  const billMock: Bill = {
    address1: 'A street',
    address2: 'Something',
    address3: 'lower'
  } as any;

  beforeEach(() => {
    service = new BillMatcherService();
  });

  it('always matches the empty string', () => {
    expect(service.matches('', billMock)).toBeTruthy();
  });

  it('ignores case and spaces', () => {
    expect(service.matches('some', billMock)).toBeTruthy();
    expect(service.matches('a stre', billMock)).toBeTruthy();
    expect(service.matches('bla', billMock)).toBeFalsy();
  });

  it('does not search within a field', () => {
    expect(service.matches('street', billMock)).toBeFalsy();
  });
});
