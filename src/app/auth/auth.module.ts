import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdButtonModule, MdCardModule, MdProgressSpinnerModule } from '@angular/material';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AuthWidgetComponent } from './auth-widget/auth-widget.component';

@NgModule({
  imports: [
    CommonModule,
    MdButtonModule,
    MdProgressSpinnerModule,
    MdCardModule
  ],
  declarations: [
    AccountInfoComponent,
    AuthWidgetComponent
  ],
  exports: [
    AccountInfoComponent,
    AuthWidgetComponent
  ]
})
export class AuthModule { }
