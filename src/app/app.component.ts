import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sb';
  bills: FirebaseListObservable<any>;
  user: Observable<firebase.User>;
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
  }

  ngOnInit() {
    this.bills = this.db.list('billing/bills', {
      query: { limitToFirst: 15 }
    });
    this.user = this.auth.authState;
  }

  login() {
    this.auth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.auth.auth.signOut();
  }
}
