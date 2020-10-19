import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { dateForUID } from '../../src/app/shared/date-helper'
import { Bill } from './../../src/app/bills/bill'

admin.initializeApp(functions.config().firebase)
const db = admin.database()

/**
 * There is a race condition in updateBillIds: it can happen that the same bill
 * number is assigned to multiple bills by the system. It is very unlikely, since
 * it is not expected that a user adds muliple bills within a few milliseconds.
 * However, if this happens, the user can manually change the bill id in the UI.
 */

export const updateBillIds = functions.database.ref('billing/bills/{billId}').onCreate((event) => {
  const setIdPromise = event.ref.child('id').set(event.key)

  if (event.val().humanId) return setIdPromise

  return new Promise((resolve, reject) => {
    db.ref('billing/bills')
      .orderByChild('humanId')
      .limitToLast(1)
      .once('value', (snapshot) => {
        const val = snapshot.val()
        const lastVersionInDb = val[Object.keys(val)[0]].humanId
        const nextHumanId = lastVersionInDb + 1
        event.ref.child('humanId').set(nextHumanId)
        Promise.all([setIdPromise, setHumanId(event, nextHumanId), setUid(event, nextHumanId)])
          .then(() => resolve())
          .catch((error) => reject(error))
      })
  })
})

async function setHumanId(data: functions.database.DataSnapshot, nextHumanId: number) {
  data.ref.child('humanId').set(nextHumanId)
}

async function setUid(data: functions.database.DataSnapshot, nextHumanId: number) {
  const uidStr = `${dateForUID()}${nextHumanId}`
  data.ref.child('uid').set(+uidStr)
}
