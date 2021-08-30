import { saveAs } from 'file-saver'
import { paymentInfo } from './payment-info'
import { BillView } from '../../bills/bill-view'
import { toFilename } from '../../utils/string'

export async function generatePDFBill(bill: BillView): Promise<void> {
  const swissqrbill = (await import('swissqrbill/lib/browser')).default

  const filename = toFilename(`Rechnung ${bill.uid}`)

  const stream = swissqrbill.BlobStream()
  const pdf = new swissqrbill.PDF(await paymentInfo(bill), stream, { size: 'A4' })

  return new Promise<void>((resolve, reject) => {
    try {
      pdf.on('finish', () => {
        const blob = stream.toBlob('application/pdf')
        saveAs(blob, filename, { autoBom: true })
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}
