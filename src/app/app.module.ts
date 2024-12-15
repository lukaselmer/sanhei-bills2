import { AsyncPipe, JsonPipe, registerLocaleData } from '@angular/common'
import lcoaleDECH from '@angular/common/locales/de-CH'
import { LOCALE_ID, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServiceWorkerModule } from '@angular/service-worker'
import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AuthModule } from './auth/auth.module'
import { BillsModule } from './bills/bills.module'
import { PageNotFoundComponent } from './not-found.component'
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'
import { getDatabase, provideDatabase } from '@angular/fire/database'
import { getAuth, provideAuth } from '@angular/fire/auth'

registerLocaleData(lcoaleDECH)

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    AuthModule,
    BillsModule,
    AppRoutingModule,
    JsonPipe,
    AsyncPipe,
  ],
  declarations: [AppComponent, PageNotFoundComponent],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-CH' },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
