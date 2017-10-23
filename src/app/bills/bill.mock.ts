import { articleVariant } from './article.mock';
import { Bill } from './bill';
import { NewBill } from './new-bill';

const newBill: NewBill = {
  cashback: 2.5,
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

  articles: [articleVariant()]
};

const bill = {
  id: 'RaNdOm1000',
  humanId: 1234,
  uid: 17061234,

  createdAt: new Date(2017, 5, 22).getTime(),
  updatedAt: new Date(2017, 5, 24).getTime(),
  deletedAt: undefined,

  cashback: newBill.cashback,
  vat: newBill.vat,
  discount: newBill.discount,
  address: newBill.address,
  billType: newBill.billType,
  description: newBill.description,
  ordererName: newBill.ordererName,
  ownerName: newBill.ownerName,
  title: newBill.title,
  descriptionTitle: newBill.descriptionTitle,
  finished: newBill.finished,
  paid: newBill.paid,
  billedAt: newBill.billedAt,
  workedAt: newBill.workedAt,
  orderedAt: newBill.orderedAt,

  articles: newBill.articles
};

export function billVariant(attributes: Partial<Bill> = {}): Bill {
  return { ...bill, ...attributes };
}

export function newBillVariant(attributes: Partial<NewBill> = {}): NewBill {
  return { ...newBill, ...attributes };
}
