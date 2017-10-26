import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressBarModule
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
import { Bill } from './../bill';
import { EditedBill } from './../edited-bill';
import { BillPrintComponent } from './bill-print.component';

describe('BillPrintComponent', () => {
  let component: BillPrintComponent;
  let fixture: ComponentFixture<BillPrintComponent>;

  const bill = billVariant({
    id: 'oiawefjawef',
    humanId: 1234,
    uid: 17071234,
    address: 'Adresszeile 1\nAdressezeile 2',
    title: 'Objekt: Adresse',
    descriptionTitle: 'Zusatz'
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatButtonModule,
          MatCardModule,
          MatIconModule,
          MatListModule,
          MatNativeDateModule,
          NoopAnimationsModule,
          RouterTestingModule
        ],
        providers: [
          {
            provide: BillsService,
            useValue: {
              editBill: (id: string): Observable<Bill> => {
                expect(id).toEqual(bill.id);
                return Observable.of(bill);
              },
              markAsPrinted: () => {}
            }
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: {
                  id: bill.id
                }
              }
            }
          }
        ],
        declarations: [BillPrintComponent]
      }).compileComponents();
    })
  );

  beforeEach(
    fakeAsync(() => {
      fixture = TestBed.createComponent(BillPrintComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick(1);
    })
  );

  it('renders the title', () => {
    const service: BillsService = TestBed.get(BillsService);

    const compiled = fixture.debugElement.nativeElement;
    const element: HTMLHeadingElement = compiled.querySelector('h1');

    expect(element.innerText).toEqual('Rechnung 17071234');
  });
});
