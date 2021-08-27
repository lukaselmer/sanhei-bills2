import * as admin from 'firebase/compat-admin'
import * as functions from 'firebase/compat-functions'
import { dateForUID } from './date-helper'

admin.initializeApp(functions.config().firebase)

/**
 * There is a race condition in updateBillIds: it can happen that the same bill
 * number is assigned to multiple bills by the system. It is very unlikely, since
 * it is not expected that a user adds muliple bills within a few milliseconds.
 * However, if this happens, the user can manually change the bill id in the UI.
 */

export const updateBillIds = functions
  .region('europe-west6')
  .database.ref('billing/bills/{billId}')
  .onCreate(async (data) => {
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
  })
