import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'sb-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss']
})

export class BillsListComponent implements OnInit {
  bills: FirebaseListObservable<any>;

  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) { }

  ngOnInit() {
    this.bills = this.db.list('billing/bills', {
      query: { limitToFirst: 15 }
    });
  }
}
