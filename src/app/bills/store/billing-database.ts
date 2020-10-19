import { Bill } from './../bill'

export interface IBillingDatabase {
  bills: { [index: string]: Bill }
}
