import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatIconModule,
  MatInputModule, MatListModule, MatNativeDateModule, MatProgressBarModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as firebase from 'firebase/app';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { billVariant } from '../bill.mock';
import { BillsService } from '../bills.service';
import { DataStoreService } from '../store/data-store.service';
import { ArticlesService } from './../articles.service';
import { Bill } from './../bill';
import { BillEditComponent } from './bill-edit.component';
import { BillFormComponent } from './bill-form.component';

describe('BillEditComponent', () => {
  let component: BillEditComponent;
  let fixture: ComponentFixture<BillEditComponent>;

  const bill = billVariant({
    id: '1234',
    uid: 17071234,
    address: 'Adresszeile 1\nAdressezeile 2',
    title: 'Objekt: Adresse',
    descriptionTitle: 'Zusatz'
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressBarModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: BillsService, useValue: {
            editBill: (id: string): Observable<Bill> => {
              expect(id).toEqual(bill.id);
              return Observable.of(bill);
            },
            updateBill: (billToUpdate: Bill): void => undefined
          }
        }, {
          provide: ArticlesService, useValue: {
            updateArticles: () => Promise.resolve('')
          }
        }, {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              params: {
                id: bill.id
              }
            }
          }
        }
      ],
      declarations: [BillEditComponent, BillFormComponent]
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(BillEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(1);
  }));

  it('submits the form', inject([BillsService], (service: BillsService) => {
    const updateBillSpy = spyOn(service, 'updateBill');
    const abortSpy = spyOn(component, 'navigateToIndex');
    abortSpy.and.returnValue(false);
    component.saveBill({ a: 'bill' } as any);
    expect(abortSpy).toHaveBeenCalled();
    expect(updateBillSpy).toHaveBeenCalledWith({ a: 'bill' } as any);
  }));

  it('aborts editing', fakeAsync(() => {
    const router: Router = TestBed.get(Router);
    fixture.detectChanges();
    spyOn(router, 'navigate').and.returnValue('');
    const compiled = fixture.debugElement.nativeElement;
    component.navigateToIndex();
    expect(router.navigate).toHaveBeenCalledWith(['bills']);
  }));
});
