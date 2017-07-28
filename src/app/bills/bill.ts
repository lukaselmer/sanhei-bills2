export class Bill {
  id: number;
  cashback: number;
  uid: number;
  vat: number;
  workHours: number;

  finished: boolean; // means finished editing
  paid: boolean;
  deleted: boolean;

  address1: string;
  address2: string;
  address3: string;
  address4: string;
  address5: string;
  billType: string;
  description: string;
  fixedAtOverride: string;
  ordererName: string;
  ownerName: string;
  title1: string;
  title2: string;
  worker: string;

  // date format: '' or 2017-05-30
  fixedAt: string;
  orderedAt: string;

  // datetime format: '' or 2010-04-23 14:35:57 UTC
  billedAt: string;
  createdAt: string;
  updatedAt: string;
}
