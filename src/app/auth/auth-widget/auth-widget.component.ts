import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import firebase from 'firebase/app'
@Component({
  selector: 'sb-auth-widget',
  templateUrl: './auth-widget.component.html',
  styleUrls: ['./auth-widget.component.scss'],
})
export class AuthWidgetComponent implements OnInit {
  userSession:
    | { status: 'unknown' }
    | { status: 'signedIn'; user: firebase.User }
    | { status: 'signedOut' } = { status: 'unknown' }

  constructor(private readonly auth: AngularFireAuth) {}

  ngOnInit() {
    this.auth.authState.subscribe((user) => this.updateSignInState(user))
  }

  updateSignInState(user: firebase.User | null) {
    this.userSession = user ? { status: 'signedIn', user } : { status: 'signedOut' }
  }

  login() {
    this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())
  }

  logout() {
    this.auth.signOut()
  }
}
