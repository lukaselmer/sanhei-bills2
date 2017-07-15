import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Bill } from './bill';

@Injectable()
export class BillsService {
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) { }

  forIndex(): Observable<Bill[]> {
    return this.db.list('billing/bills', {
      query: { limitToFirst: 15, orderByChild: 'id', startAt: 1001 }
    });
  }
}
