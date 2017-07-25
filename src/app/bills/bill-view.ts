import { Bill } from './bill';

export class BillView {
  constructor(public bill: Bill) { }

  get id() { return this.bill.id; }
  get cashback() { return this.bill.cashback; }
  get uid() { return this.bill.uid; }
  get vat() { return this.bill.vat; }
  get workHours() { return this.bill.workHours; }

  get finished() { return this.bill.finished; } // means finished editing
  get paid() { return this.bill.paid; }
  get deleted() { return this.bill.deleted; }

  get address() {
    return [
      this.bill.address1,
      this.bill.address2,
      this.bill.address3,
      this.bill.address4,
      this.bill.address5
    ].filter(line => line);
  }

  get commaSeparatedAddress() {
    return this.address.join(', ');
  }

  get address1() { return this.bill.address1; }
  get address2() { return this.bill.address2; }
  get address3() { return this.bill.address3; }
  get address4() { return this.bill.address4; }
  get address5() { return this.bill.address5; }
  get billType() { return this.bill.billType; }
  get description() { return this.bill.description; }
  get fixedAtOverride() { return this.bill.fixedAtOverride; }
  get ordererName() { return this.bill.ordererName; }
  get ownerName() { return this.bill.ownerName; }
  get title1() { return this.bill.title1; }
  get title2() { return this.bill.title2; }
  get worker() { return this.bill.worker; }

  // date format: '' or 2017-05-30
  get fixedAt() { return this.bill.fixedAt ? new Date(this.bill.fixedAt) : null; }
  get orderedAt() { return this.bill.orderedAt ? new Date(this.bill.orderedAt) : null; }

  // datetime format: '' or 2010-04-23 14:35:57 UTC
  get billedAt() { return this.bill.billedAt ? new Date(this.bill.billedAt) : null; }
  get createdAt() { return this.bill.createdAt ? new Date(this.bill.createdAt) : null; }
  get updatedAt() { return this.bill.updatedAt ? new Date(this.bill.updatedAt) : null; }
}
