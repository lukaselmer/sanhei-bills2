import { TestBed, waitForAsync } from '@angular/core/testing'
import { Auth } from '@angular/fire/auth'
import { Database } from '@angular/fire/database'
import { RouterTestingModule } from '@angular/router/testing'
import { AppComponent } from './app.component'
import { AccountInfoComponent } from './auth/account-info/account-info.component'
import { AuthWidgetComponent } from './auth/auth-widget/auth-widget.component'
import { BillsListComponent } from './bills/bills-list/bills-list.component'
import { BillsService } from './bills/bills.service'
import { MaterialModule } from './material/material.module'

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, RouterTestingModule],
      providers: [
        {
          provide: BillsService,
          useValue: {
            search: () => undefined,
          },
        },
        {
          provide: Database,
          useValue: {
            list: () => undefined,
          },
        },
        {
          provide: Auth,
          useValue: {
            authState: {
              subscribe: () => undefined,
            },
          },
        },
      ],
      declarations: [AuthWidgetComponent, AccountInfoComponent, AppComponent, BillsListComponent],
    }).compileComponents()
  }))

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  }))

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
})
