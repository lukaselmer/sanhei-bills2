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
<<<<<<< HEAD
import { BillsModule } from './bills/bills.module';
=======
>>>>>>> aa439f26e896148c99db5fdb53d4573a8b7907da

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
<<<<<<< HEAD
    MdButtonModule,
    MdProgressSpinnerModule,
    MdCardModule,
    MaterialModule,
    AuthModule,
    BillsModule
=======
    AuthModule
>>>>>>> aa439f26e896148c99db5fdb53d4573a8b7907da
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
