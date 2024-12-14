import { Component, Input } from '@angular/core'
import { Auth } from '@angular/fire/auth'
import { type UserInfo } from '@firebase/auth'

@Component({
  selector: 'sb-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  standalone: false,
})
export class AccountInfoComponent {
  @Input() user: UserInfo | undefined

  showDetails = false

  constructor(private readonly auth: Auth) {}

  toggle() {
    this.showDetails = !this.showDetails
  }

  logout() {
    this.auth.signOut()
  }
}
