import { Article } from './article';
import { ArticleView } from './article-view';
import { articleVariant } from './article.mock';
import { Bill } from './bill';
import { BillView } from './bill-view';
import { billVariant } from './bill.mock';

function billView(bill: Partial<Bill> = {}) {
  return new BillView(billVariant(bill));
}

describe('BillView', () => {
  describe('address lines helpers', () => {
    it('converts all address fields', () => {
      expect(billView().addressLines).toEqual([
        'address1',
        'address2',
        'address3',
        'address4',
        'address5'
      ]);
    });

    it('omits empty fields', () => {
      expect(
        billView({
          address: '\naddress3\n\naddress5\n'
        }).addressLines
      ).toEqual(['address3', 'address5']);
    });

    it('comma separates the address', () => {
      expect(
        billView({
          address: '1\n2\n3\n4\n5'
        }).commaSeparatedAddress
      ).toEqual('1, 2, 3, 4, 5');
    });

    it('gets the first, last, and middle address lines', () => {
      const view = billView({
        address: '1\n2\n3\n4\n5'
      });
      expect(view.firstAddressLine).toEqual('1');
      expect(view.lastAddressLine).toEqual('5');
      expect(view.middleAddressLines).toEqual(['2', '3', '4']);
    });
  });

  describe('bill articles and articles', () => {
    it('merges articles and bill articles', () => {
      const billArticleView = new ArticleView(articleVariant());
      expect(billView().articles).toEqual([billArticleView]);
    });

    describe('totals calculation', () => {
      it('total net', () => {
        expect(billView().totalNet).toEqual(5 * 150);
        expect(
          billView({
            articles: [
              articleVariant({
                amount: 10,
                price: 20
              }),
              articleVariant({
                amount: 3,
                price: 100
              })
            ]
          }).totalNet
        ).toEqual(10 * 20 + 3 * 100);
        expect(billView({ articles: [] }).totalNet).toEqual(0);
      });

      it('discount', () => {
        expect(billView().totalDiscount).toEqual(30 /* 5 * 150 * 0.04 */);
      });
      it('totalAfterDiscount', () => {
        expect(billView().totalAfterDiscount).toEqual(720 /* 750 - 30 */);
      });
      it('cashback', () => {
        expect(billView().totalCashback).toEqual(18 /* (5 * 150 - 30) * 0.025 */);
      });
      it('totalAfterCashback', () => {
        expect(billView().totalAfterCashback).toEqual(702 /* 750 - 30 - 18 */);
      });
      it('vat', () => {
        expect(billView().totalVat).toEqual(31.65 /* rounded: (5 * 150 - 30 - 18) * 0.0451 */);
      });

      describe('rounding the', () => {
        it('discount', () => {
          expect(
            billView({
              discount: 4.002
            }).totalDiscount
          ).toEqual(30);
          expect(
            billView({
              discount: 3.998
            }).totalDiscount
          ).toEqual(30);
        });

        it('cashback', () => {
          expect(
            billView({
              cashback: 3.409722222
            }).totalCashback
          ).toEqual(24.55);
          expect(
            billView({
              cashback: 3.4131943
            }).totalCashback
          ).toEqual(24.55);
          expect(
            billView({
              cashback: 3.4131945
            }).totalCashback
          ).toEqual(24.6);
        });

        it('vat', () => {
          expect(
            billView({
              vat: 6.413675214
            }).totalVat
          ).toEqual(45);
          expect(
            billView({
              vat: 6.406837607
            }).totalVat
          ).toEqual(45);
        });
      });

      it('total gross', () => {
        expect(
          billView({
            cashback: 3.409999,
            discount: 3.5302633,
            vat: 3.67
          }).totalGross
        ).toEqual(724.5 /* rounded 750 - 25.55 - 25.55 + 25.60 */);
      });
    });
  });
});
