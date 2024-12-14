import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { AccountInfoComponent } from './account-info/account-info.component'
import { AuthWidgetComponent } from './auth-widget/auth-widget.component'

@NgModule({
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule],
  declarations: [AccountInfoComponent, AuthWidgetComponent],
  exports: [AccountInfoComponent, AuthWidgetComponent],
})
export class AuthModule {}
