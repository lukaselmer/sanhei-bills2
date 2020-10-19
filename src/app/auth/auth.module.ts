import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { AccountInfoComponent } from './account-info/account-info.component'
import { AuthWidgetComponent } from './auth-widget/auth-widget.component'

@NgModule({
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule],
  declarations: [AccountInfoComponent, AuthWidgetComponent],
  exports: [AccountInfoComponent, AuthWidgetComponent],
})
export class AuthModule {}
