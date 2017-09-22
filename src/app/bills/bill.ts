export class Bill {
  id: number;
  cashback: number;
  uid: number;
  vat: number;
  workHours: number;
  discount: number;

  finished: boolean; // means finished editing
  paid: boolean;
  deleted: boolean;

  address: string;
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

  // timestamp * 1000 format: 1272033357000 (for 2010-04-23 14:35:57 UTC)
  // see https://firebase.google.com/docs/database/web/offline-capabilities
  // firebase.database.ServerValue.TIMESTAMP
  createdAt: number;
  updatedAt: number;
}
