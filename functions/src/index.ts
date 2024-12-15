import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { dateForUID } from './date-helper'
import { onValueCreated } from 'firebase-functions/database'

admin.initializeApp(functions.config().firebase)

/**
 * There is a race condition in updateBillIds: it can happen that the same bill
 * number is assigned to multiple bills by the system. It is very unlikely, since
 * it is not expected that a user adds multiple bills within a few milliseconds.
 * However, if this happens, the user can manually change the bill id in the UI.
 */

export const updateBillIds = onValueCreated(
  {
    ref: 'billing/bills/{billId}',
    region: 'europe-west6',
  },
  async (event) => {
    const data = event.data
    if (data.val().humanId) return data.ref.update({ id: data.key })

    const snapshot = await admin
      .database()
      .ref('billing/bills')
      .orderByChild('humanId')
      .limitToLast(1)
      .once('value')
    const val = snapshot.val()
    const lastVersionInDb = val[Object.keys(val)[0]].humanId
    const nextHumanId = lastVersionInDb + 1
    const uidStr = `${dateForUID()}${nextHumanId}`
    await data.ref.update({ id: data.key, humanId: nextHumanId, uid: +uidStr })
  },
)
