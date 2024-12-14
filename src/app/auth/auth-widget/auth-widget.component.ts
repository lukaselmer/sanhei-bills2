import { Component, OnInit } from '@angular/core'
import { GoogleAuthProvider } from '@angular/fire/auth'
import { type UserInfo } from '@firebase/auth'
import { AngularFireAuth } from '@angular/fire/compat/auth'

@Component({
    selector: 'sb-auth-widget',
    templateUrl: './auth-widget.component.html',
    styleUrls: ['./auth-widget.component.scss'],
    standalone: false
})
export class AuthWidgetComponent implements OnInit {
  userSession: { status: 'unknown' } | { status: 'signedIn'; user: UserInfo } | { status: 'signedOut' } =
    { status: 'unknown' }

  constructor(private readonly auth: AngularFireAuth) {}

  ngOnInit() {
    this.auth.authState.subscribe((user) => this.updateSignInState(user))
  }

  updateSignInState(user: UserInfo | null) {
    this.userSession = user ? { status: 'signedIn', user } : { status: 'signedOut' }
  }

  login() {
    this.auth.signInWithRedirect(new GoogleAuthProvider())
  }

  logout() {
    this.auth.signOut()
  }
}
