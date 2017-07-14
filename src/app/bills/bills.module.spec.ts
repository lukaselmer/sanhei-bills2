import { BillsModule } from './bills.module';

describe('BillsModule', () => {
  let billsModule: BillsModule;

  beforeEach(() => {
    billsModule = new BillsModule();
  });

  it('should create an instance', () => {
    expect(billsModule).toBeTruthy();
  });
});
