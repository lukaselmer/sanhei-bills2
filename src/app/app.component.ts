import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sb';
  bills: FirebaseListObservable<any>;

  constructor(private db: AngularFireDatabase) { }

  ngOnInit() {
    this.bills = this.db.list('billing/bills', {
      query: { limitToFirst: 15 }
    });
  }

}
