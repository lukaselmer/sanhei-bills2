import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AppComponent } from './app.component';
import { AccountInfoComponent } from './auth/account-info/account-info.component';
import { AuthWidgetComponent } from './auth/auth-widget/auth-widget.component';
import { BillsListComponent } from './bills/bills-list/bills-list.component';
import { BillsService } from './bills/bills.service';
import { MaterialModule } from './material/material.module';

describe('AppComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MaterialModule, RouterTestingModule],
        providers: [
          {
            provide: BillsService,
            useValue: {
              search: () => undefined
            }
          },
          {
            provide: AngularFireDatabase,
            useValue: {
              list: () => undefined
            }
          },
          {
            provide: AngularFireAuth,
            useValue: {
              authState: {
                subscribe: () => undefined
              }
            }
          }
        ],
        declarations: [AuthWidgetComponent, AccountInfoComponent, AppComponent, BillsListComponent]
      }).compileComponents();
    })
  );

  it(
    'should create the app',
    async(() => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app).toBeTruthy();
    })
  );

  // it(`should have as title 'sb'`, async(() => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('sb');
  // }));

  // it('should render title in a h1 tag', async(() => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('Welcome to sb!!');
  // }));
});
