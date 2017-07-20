export class Bill {
  id: number;
  cashback: number;
  uid: number;
  vat: number;
  workHours: number;

  deleted: boolean;
  finished: boolean;
  paid: boolean;

  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  billType?: string;
  description?: string;
  fixedAtOverride?: string;
  ordererName?: string;
  ownerName?: string;
  title1?: string;
  title2?: string;
  worker?: string;

  fixedAt?: string;
  orderedAt?: string;
  billedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
