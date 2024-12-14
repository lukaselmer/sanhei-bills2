import { Component, Input } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { type UserInfo } from '@firebase/auth'

@Component({
    selector: 'sb-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss'],
    standalone: false
})
export class AccountInfoComponent {
  @Input() user: UserInfo | undefined

  showDetails = false

  constructor(private readonly auth: AngularFireAuth) {}

  toggle() {
    this.showDetails = !this.showDetails
  }

  logout() {
    this.auth.signOut()
  }
}
