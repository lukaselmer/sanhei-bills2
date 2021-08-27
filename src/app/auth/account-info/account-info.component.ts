import { Component, Input } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import firebase from 'firebase/compat/app'

@Component({
  selector: 'sb-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent {
  @Input() user: firebase.User | undefined

  showDetails = false

  constructor(private readonly auth: AngularFireAuth) {}

  toggle() {
    this.showDetails = !this.showDetails
  }

  logout() {
    this.auth.signOut()
  }
}
