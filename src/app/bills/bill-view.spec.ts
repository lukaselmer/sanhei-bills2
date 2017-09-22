import { Bill } from './bill';
import { BillView } from './bill-view';
import { billVariant } from './bill.mock';

function billView(attributes: Partial<Bill> = {}) {
  return new BillView(billVariant(attributes));
}

describe('BillView', () => {
  describe('address lines helpers', () => {
    it('converts all address fields', () => {
      expect(billView().addressLines).toEqual([
        'address1', 'address2', 'address3', 'address4', 'address5'
      ]);
    });

    it('omits empty fields', () => {
      expect(billView({
        address: '\naddress3\n\naddress5\n'
      }).addressLines).toEqual([
        'address3', 'address5'
      ]);
    });

    it('comma separates the address', () => {
      expect(billView({ address: '1\n2\n3\n4\n5' }).commaSeparatedAddress).toEqual(
        '1, 2, 3, 4, 5'
      );
    });
  });
});
