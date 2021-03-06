import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import * as firebase from 'firebase/app'

@Component({
  selector: 'sb-auth-widget',
  templateUrl: './auth-widget.component.html',
  styleUrls: ['./auth-widget.component.scss'],
})
export class AuthWidgetComponent implements OnInit {
  user: firebase.User | null | undefined
  loginStatus: 'unknown' | 'signedIn' | 'signedOut' = 'unknown'

  constructor(private readonly auth: AngularFireAuth) {}

  ngOnInit() {
    this.auth.authState.subscribe((user) => this.updateLoginStatus(user))
  }

  updateLoginStatus(user: firebase.User | null) {
    this.user = user
    this.loginStatus = user ? 'signedIn' : 'signedOut'
  }

  login() {
    this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())
  }

  logout() {
    this.auth.signOut()
  }
}
