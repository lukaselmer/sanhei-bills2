import { Bill } from './../../bill'

export interface IBillMatcher {
  matches(bill: Bill): boolean
}
