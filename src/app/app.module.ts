import { NgModule } from '@angular/core';
import { MaterialModule, MdButtonModule, MdCardModule, MdCheckbox, MdList, MdListItem, MdProgressSpinnerModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import 'hammerjs';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MdButtonModule,
    MdProgressSpinnerModule,
    MdCardModule,
    MaterialModule
    AuthModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
