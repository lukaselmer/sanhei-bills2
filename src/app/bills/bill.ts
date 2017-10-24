import { Article } from './article';

export class Bill {
  id: string;
  humanId: number;
  cashback: number;
  uid: number;
  vat: number;
  discount: number;
  paymentDeadlineInDays?: number;

  articles: Article[];

  finished: boolean; // means finished editing
  paid: boolean;

  address: string;
  billType: string;
  description: string;
  ordererName: string;
  ownerName: string;
  title: string;
  descriptionTitle: string;

  // date format: '' or free text or 2017-05-30 or 2017-05-20, 2017-05-21, 2017-05-22
  workedAt: string;

  // date format: '' or 2017-05-30
  orderedAt: string;
  billedAt: string;

  // timestamp * 1000 format: 1272033357000 (for 2010-04-23 14:35:57 UTC)
  // see https://firebase.google.com/docs/database/web/offline-capabilities
  // firebase.database.ServerValue.TIMESTAMP
  createdAt: number;
  updatedAt: number;
  deletedAt: number | undefined;
}
