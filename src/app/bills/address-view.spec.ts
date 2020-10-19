import { AddressView } from './address-view'
import { Article } from './article'
import { ArticleView } from './article-view'
import { articleVariant } from './article.mock'
import { Bill } from './bill'
import { BillView } from './bill-view'
import { billVariant } from './bill.mock'

function addressView(address = '1\n2\n3\n4\n5') {
  return new AddressView(address)
}

describe('AddressView', () => {
  it('converts all address fields', () => {
    expect(addressView().lines).toEqual(['1', '2', '3', '4', '5'])
  })

  it('omits empty fields', () => {
    expect(addressView('\naddress3\n\naddress5\n').lines).toEqual(['address3', 'address5'])
  })

  it('comma separates the address', () => {
    expect(addressView().commaSeparated).toEqual('1, 2, 3, 4, 5')
  })

  it('gets the first address line', () => {
    expect(addressView().firstLine).toEqual('1')
  })

  it('gets the last address line', () => {
    expect(addressView().lastLine).toEqual('5')
  })

  it('gets the middle address lines', () => {
    expect(addressView().middleLines).toEqual(['2', '3', '4'])
  })
})
