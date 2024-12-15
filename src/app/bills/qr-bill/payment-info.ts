import { BillView } from '../bill-view'
import type { data } from 'swissqrbill/lib/swissqrbill'
import { isQRIBAN, calculateQRReferenceChecksum } from 'swissqrbill/lib/utils'
import { exactLen } from '../../utils/string'

export async function paymentInfo(bill: BillView): Promise<data> {
  const addressView = bill.addressView
  return {
    currency: 'CHF',
    reference: await calculateReferenceNumber(bill),
    creditor: {
      name: 'Sanhei AG',
      address: 'Georg-Kempf-Strasse 26',
      city: 'Zürich',
      zip: '8046',
      country: 'CH',
      account: sanheiIBAN,
    },
    amount: bill.totalGross,
    message: `${bill.billType} ${bill.uid}`,
    debitor: {
      name: addressView.billName,
      address: addressView.billAddress,
      zip: addressView.billZip,
      city: addressView.billCity,
      country: addressView.billCountry,
    },
  }
}

async function calculateReferenceNumber(billView: BillView) {
  // lazy loading currently disabled, because it broke with Angular 19
  // const swissqrbillUtils = await import('swissqrbill/lib/utils')
  await Promise.resolve()

  if (!isQRIBAN(sanheiIBAN)) return undefined

  const referenceWithoutChecksum = `${exactLen(26, `${billView.uid}`)}`
  const checksum = calculateQRReferenceChecksum(referenceWithoutChecksum)
  return `${referenceWithoutChecksum}${checksum}`
}

const sanheiIBAN = 'CH2730047016041690010'
