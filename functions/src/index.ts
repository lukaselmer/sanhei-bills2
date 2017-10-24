import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { dateForUID } from '../../src/app/shared/date-helper';
import { Bill } from './../../src/app/bills/bill';

admin.initializeApp(functions.config().firebase);
const db = admin.database();
let lastSetVersion = 0;

/**
 * There is a race condition in updateBillIds: it can happen that the same bill
 * number is assigned to multiple bills by the system. It is very unlikely, since
 * it is not expected that a user adds muliple bills within a few milliseconds.
 * However, if this happens, the user can manually change the bill id in the UI.
 */

async function setHumanId(data: functions.database.DeltaSnapshot, nextHumanId: number) {
  data.ref.child('humanId').set(nextHumanId);
}

async function setUid(data: functions.database.DeltaSnapshot, nextHumanId: number) {
  const uidStr = `${dateForUID()}${nextHumanId}`;
  data.ref.child('uid').set(+uidStr);
}

export const updateBillIds = functions.database.ref('billing/bills/{billId}').onCreate(event => {
  const data = event.data;
  const setIdPromise = data.ref.child('id').set(data.key);

  return new Promise((resolve, reject) => {
    db
      .ref('billing/bills')
      .orderByChild('humanId')
      .limitToLast(1)
      .once('value', snapshot => {
        const val = snapshot.val();
        const lastVersionInDb = val[Object.keys(val)[0]].humanId;
        const nextHumanId = Math.max(lastSetVersion + 1, lastVersionInDb + 1);
        lastSetVersion = nextHumanId;
        data.ref.child('humanId').set(nextHumanId);
        Promise.all([
          setIdPromise,
          setHumanId(data, nextHumanId),
          setUid(data, nextHumanId)
        ]).then(() => resolve())
          .catch(error => reject(error));
      });
  });
});
