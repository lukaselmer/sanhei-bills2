import { Bill } from './bill';

const bill = {
  id: 1000,
  cashback: 2000,
  uid: 3000,
  vat: 4.51,
  workHours: 5000,
  discount: 4,
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

export function billVariant(attributes: Partial<Bill> = {}): Bill {
  return { ...bill, ...attributes };
}
