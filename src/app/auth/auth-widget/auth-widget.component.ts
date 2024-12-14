import { Component, OnInit } from '@angular/core'
import { GoogleAuthProvider, Auth, signInWithRedirect } from '@angular/fire/auth'
import { Unsubscribe, type UserInfo } from '@firebase/auth'

@Component({
  selector: 'sb-auth-widget',
  templateUrl: './auth-widget.component.html',
  styleUrls: ['./auth-widget.component.scss'],
})
export class AuthWidgetComponent implements OnInit {
  private unsubscribe: Unsubscribe | undefined

  userSession: { status: 'unknown' } | { status: 'signedIn'; user: UserInfo } | { status: 'signedOut' } =
    { status: 'unknown' }

  constructor(private readonly auth: Auth) {}

  ngOnInit() {
    this.unsubscribe = this.auth.onAuthStateChanged((user) => this.updateSignInState(user))
  }

  ngOnDestory() {
    this.unsubscribe?.()
  }

  updateSignInState(user: UserInfo | null) {
    this.userSession = user ? { status: 'signedIn', user } : { status: 'signedOut' }
  }

  login() {
    signInWithRedirect(this.auth, new GoogleAuthProvider())
  }

  logout() {
    this.auth.signOut()
  }
}
