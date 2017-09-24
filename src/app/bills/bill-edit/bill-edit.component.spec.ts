import 'rxjs/add/observable/of';

import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MdButtonModule,
  MdCardModule,
  MdCheckboxModule,
  MdDatepickerModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdNativeDateModule,
  MdProgressBarModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

import { billVariant } from '../bill.mock';
import { BillsService } from '../bills.service';
import { Bill } from './../bill';
import { BillEditComponent } from './bill-edit.component';

describe('BillEditComponent', () => {
  let component: BillEditComponent;
  let fixture: ComponentFixture<BillEditComponent>;

  const bill = billVariant({
    id: 1234,
    uid: 17071234,
    address: 'Adresszeile 1\nAdressezeile 2',
    title1: 'Objekt: Adresse',
    title2: 'Zusatz'
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MdButtonModule,
        MdCheckboxModule,
        MdCardModule,
        MdIconModule,
        MdInputModule,
        MdListModule,
        MdProgressBarModule,
        MdNativeDateModule,
        MdDatepickerModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: BillsService, useValue: {
            editBill: (id: number): Observable<Bill> => {
              expect(id).toEqual(bill.id);
              return Observable.of(bill);
            },
            updateBill: (billToUpdate: Bill): void => undefined
          }
        },
        {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              params: {
                id: bill.id
              }
            }
          }
        }
      ],
      declarations: [BillEditComponent]
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(BillEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(1);
  }));

  it('renders the form fields and sets the values', () => {
    const compiled = fixture.debugElement.nativeElement;
    function selectField(formControlName: string): HTMLTextAreaElement {
      return compiled.querySelector(`[formControlName=${formControlName}]`);
    }

    expect(selectField('address').value).toEqual(bill.address);
    expect(selectField('cashback').value).toEqual(bill.cashback + '');
    expect(selectField('vat').value).toEqual(bill.vat + '');
    expect(selectField('workHours').value).toEqual(bill.workHours + '');
    expect(selectField('discount').value).toEqual(bill.discount + '');
    expect(selectField('address').value).toEqual(bill.address);
    expect(selectField('billType').value).toEqual(bill.billType);
    expect(selectField('ordererName').value).toEqual(bill.ordererName);
    expect(selectField('ownerName').value).toEqual(bill.ownerName);
    expect(selectField('title1').value).toEqual(bill.title1);
    expect(selectField('title2').value).toEqual(bill.title2);
    expect(selectField('worker').value).toEqual(bill.worker);
    expect(selectField('orderedAt').value).toEqual(bill.orderedAt);
    expect(selectField('description').value).toEqual(bill.description);
    expect(selectField('fixedAtDescription').value).toEqual(bill.fixedAtOverride);
    expect(selectField('billedAt').value).toEqual(bill.billedAt);
  });

  it('submits the form', inject([BillsService], (service: BillsService) => {
    const updateBillSpy = spyOn(service, 'updateBill');
    const abortSpy = spyOn(component, 'abort');
    abortSpy.and.returnValue(false);
    component.onSubmit();
    expect(abortSpy).toHaveBeenCalled();
    expect(updateBillSpy).toHaveBeenCalledWith({
      ...bill,
      fixedAt: '',
      updatedAt: firebase.database.ServerValue.TIMESTAMP as number
    });
  }));
});