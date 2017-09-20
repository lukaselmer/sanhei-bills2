import { async, TestBed } from '@angular/core/testing';
import { MdButtonModule, MdCardModule, MdInputModule, MdProgressSpinnerModule } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AccountInfoComponent } from './auth/account-info/account-info.component';
import { AuthWidgetComponent } from './auth/auth-widget/auth-widget.component';
import { BillsListComponent } from './bills/bills-list/bills-list.component';
import { BillsService } from './bills/bills.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdButtonModule,
        MdCardModule,
        MdInputModule,
        MdProgressSpinnerModule
      ],
      providers: [
        { provide: BillsService, useValue: { search: () => { } } },
        { provide: AngularFireDatabase, useValue: { list: () => { } } },
        { provide: AngularFireAuth, useValue: { authState: { subscribe: () => { } } } }
      ],
      declarations: [
        AuthWidgetComponent,
        AccountInfoComponent,
        AppComponent,
        BillsListComponent
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

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
