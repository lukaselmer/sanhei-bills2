import { registerLocaleData } from '@angular/common'
import lcoaleDECH from '@angular/common/locales/de-CH'
import { LOCALE_ID, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServiceWorkerModule } from '@angular/service-worker'
import { AngularFireModule } from 'angularfire2'
import { AngularFireAuthModule } from 'angularfire2/auth'
import { AngularFireDatabaseModule } from 'angularfire2/database'
import 'hammerjs'
import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AuthModule } from './auth/auth.module'
import { BillsModule } from './bills/bills.module'
import { PageNotFoundComponent } from './not-found.component'

registerLocaleData(lcoaleDECH)

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    AuthModule,
    BillsModule,
    AppRoutingModule,
  ],
  declarations: [AppComponent, PageNotFoundComponent],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'de-CH',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
