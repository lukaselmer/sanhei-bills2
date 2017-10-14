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

  describe('bill articles and articles', () => {
    it('merges articles and bill articles', () => {
      const billArticleView = new ArticleView(articleVariant());
      expect(billView().billArticleViews).toEqual([
        billArticleView
      ]);
    });

    describe('totals calculation', () => {
      it('total net', () => {
        expect(billView().totalNet).toEqual(5 * 150);
        expect(billView({
          articles: [
            articleVariant({ amount: 10, price: 20 }),
            articleVariant({ amount: 3, price: 100 })
          ]
        }).totalNet).toEqual(10 * 20 + 3 * 100);
        expect(billView({ articles: [] }).totalNet).toEqual(0);
      });

      it('discount', () => { expect(billView().totalDiscount).toEqual(30 /* 5 * 150 * 0.04 */); });
      it('cashback', () => { expect(billView().totalCashback).toEqual(18.75 /* 5 * 150 * 0.025 */); });
      it('vat', () => { expect(billView().totalVat).toEqual(33.85 /* rounded: 5 * 150 * 0.0451 */); });

      describe('rounding the', () => {
        it('discount', () => {
          expect(billView({ discount: 4.002 }).totalDiscount).toEqual(30);
          expect(billView({ discount: 3.998 }).totalDiscount).toEqual(30);
        });

        it('vat', () => {
          expect(billView({ vat: 6.002 }).totalVat).toEqual(45);
          expect(billView({ vat: 5.998 }).totalVat).toEqual(45);
        });

        it('cashback', () => {
          expect(billView({ cashback: 3.41 }).totalCashback).toEqual(25.6);
          expect(billView({ cashback: 3.410001 }).totalCashback).toEqual(25.6);
          expect(billView({ cashback: 3.409999 }).totalCashback).toEqual(25.55);
        });
      });

      it('total gross', () => {
        expect(billView({ cashback: 3.409999, discount: 3.409999, vat: 3.41 }).totalGross)
          .toEqual(724.5 /* rounded 750 - 25.55 - 25.55 + 25.60 */);
      });
    });
  });
});
