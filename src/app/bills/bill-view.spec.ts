import { Bill } from './bill';
import { BillView } from './bill-view';
import { billVariant } from './bill.mock';

function billView(attributes: Partial<Bill> = {}) {
  return new BillView(billVariant(attributes));
}

describe('BillView', () => {
  describe('address helpers', () => {
    it('converts all address fields', () => {
      expect(billView().address).toEqual([
        'address1', 'address2', 'address3', 'address4', 'address5'
      ]);
    });

    it('omits empty fields', () => {
      expect(billView({
        address1: '', address2: '', address4: ''
      }).address).toEqual([
        'address3', 'address5'
      ]);
    });

    it('comma separates the address', () => {
      expect(billView({ address4: '' }).commaSeparatedAddress).toEqual(
        'address1, address2, address3, address5'
      );
    });
  });
});
