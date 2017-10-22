import { articleVariant } from './article.mock';
import { Bill } from './bill';

const bill = {
  id: 'RaNdOm1000',
  humanId: 1000,
  cashback: 2.5,
  uid: 3000,
  vat: 4.51,
  discount: 4,
  address: 'address1\naddress2\naddress3\naddress4\naddress5',
  billType: 'billType',
  description: 'description',
  ordererName: 'ordererName',
  ownerName: 'ownerName',
  title: 'title',
  descriptionTitle: 'descriptionTitle',
  finished: false,
  paid: false,
  billedAt: '2017-06-22',
  workedAt: '2017-06-20',
  orderedAt: '2017-06-19',

  createdAt: new Date(2017, 5, 22).getTime(),
  updatedAt: new Date(2017, 5, 24).getTime(),
  deletedAt: undefined,

  articles: [articleVariant()]
};

export function billVariant(attributes: Partial<Bill> = {}): Bill {
  return { ...bill, ...attributes };
}
