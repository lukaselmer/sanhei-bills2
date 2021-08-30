import { BillView } from '../bill-view'
import { data } from 'swissqrbill/lib/swissqrbill'
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
  const swissqrbillUtils = await import('swissqrbill/lib/utils')

  if (!swissqrbillUtils.isQRIBAN(sanheiIBAN)) return undefined

  const referenceWithoutChecksum = `${exactLen(26, `${billView.uid}`)}`
  const checksum = swissqrbillUtils.calculateQRReferenceChecksum(referenceWithoutChecksum)
  return `${referenceWithoutChecksum}${checksum}`
}

const sanheiIBAN = 'CH4606830016041690010'
