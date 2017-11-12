import { DecimalPipe } from '@angular/common';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as firebase from 'firebase/app';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { articleVariant } from '../article.mock';
import { billVariant } from '../bill.mock';
import { BillsService } from '../bills.service';
import { DataStoreService } from '../store/data-store.service';
import { MaterialModule } from './../../material/material.module';
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
    descriptionTitle: 'Zusatz',
    articles: Array.from(Array(50).keys()).map(() => articleVariant())
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule, RouterTestingModule],
        providers: [
          DecimalPipe,
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
    })
  );

  it(
    'renders the title and calls markAsPrinted',
    fakeAsync(() => {
      const service: BillsService = TestBed.get(BillsService);
      spyOn(service, 'markAsPrinted');

      fixture.detectChanges();
      tick(11);

      const compiled = fixture.debugElement.nativeElement;
      const element: HTMLHeadingElement = compiled.querySelector('h1');

      expect(service.markAsPrinted).toHaveBeenCalled();
      expect(element.innerText).toEqual('Rechnung 17071234');
    })
  );

  it(
    'renders page breaks',
    fakeAsync(() => {
      fixture.detectChanges();
      const compiled: HTMLElement = fixture.debugElement.nativeElement;
      const element: HTMLHeadingElement = compiled.querySelector('h1') as HTMLHeadingElement;
      expect(compiled.innerText).not.toMatch('Übertrag');
      tick(5);
      expect(compiled.innerText).not.toMatch('Übertrag');
      tick(6);
      expect(compiled.innerText).toMatch('Übertrag');
    })
  );
});
