import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'sb-auth-widget',
  templateUrl: './auth-widget.component.html',
  styleUrls: ['./auth-widget.component.scss']
})
export class AuthWidgetComponent implements OnInit {
  user: firebase.User;
  loginStatus: 'unknown' | 'signedIn' | 'signedOut' = 'unknown';

  constructor(private auth: AngularFireAuth) { }

  ngOnInit() {
    this.auth.authState.subscribe(user => this.updateLoginStatus(user));
  }

  updateLoginStatus(user: firebase.User) {
    this.user = user;
    this.loginStatus = user ? 'signedIn' : 'signedOut';
  }

  login() {
    this.auth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.auth.auth.signOut();
  }
}