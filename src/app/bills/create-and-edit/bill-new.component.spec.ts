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
import { newBillVariant } from '../bill.mock';
import { BillsService } from '../bills.service';
import { DataStoreService } from '../store/data-store.service';
import { ArticlesService } from './../articles.service';
import { Bill } from './../bill';
import { NewBill } from './../new-bill';
import { ArticlesFormComponent } from './articles-form.component';
import { BillFormComponent } from './bill-form.component';
import { BillNewComponent } from './bill-new.component';

describe('BillNewComponent', () => {
  let component: BillNewComponent;
  let fixture: ComponentFixture<BillNewComponent>;

  const newBill = newBillVariant({ articles: [] });

  function fillForm() {
    const compiled = fixture.debugElement.nativeElement;
    function selectField(formControlName: string): HTMLInputElement {
      return compiled.querySelector(`[formControlName=${formControlName}]`);
    }

    function selectTextarea(formControlName: string): HTMLTextAreaElement {
      return compiled.querySelector(`textarea[formControlName=${formControlName}]`);
    }

    function fill(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
      el.focus();
      el.value = value;
      el.dispatchEvent(new Event('input'));
    }

    fill(selectField('cashback'), newBill.cashback + '');
    fill(selectField('vat'), newBill.vat + '');
    fill(selectField('discount'), newBill.discount + '');
    fill(selectField('billType'), newBill.billType);
    fill(selectField('ordererName'), newBill.ordererName);
    fill(selectField('ownerName'), newBill.ownerName);
    fill(selectField('title'), newBill.title);
    fill(selectField('descriptionTitle'), newBill.descriptionTitle);
    fill(selectField('orderedAt'), newBill.orderedAt);
    fill(selectField('billedAt'), newBill.billedAt);
    fill(selectField('workedAt'), newBill.workedAt);
    fill(selectTextarea('address'), newBill.address);
    fill(selectTextarea('description'), newBill.description);
  }

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
            createBill: (billToUpdate: NewBill): void => undefined
          }
        }, {
          provide: ArticlesService, useValue: {
            updateArticles: () => Promise.resolve(''),
            autocompleteOptions: () => []
          }
        }
      ],
      declarations: [BillNewComponent, BillFormComponent, ArticlesFormComponent]
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(BillNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(1);
  }));

  it('submits the form', () => {
    const service: BillsService = TestBed.get(BillsService);
    spyOn(service, 'createBill');
    const abortSpy = spyOn(component, 'navigateToIndex').and.returnValue(false);

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('form');
    element.dispatchEvent(new Event('submit'));

    expect(component.navigateToIndex).not.toHaveBeenCalled();
    expect(service.createBill).not.toHaveBeenCalled();

    fillForm();

    element.dispatchEvent(new Event('submit'));
    expect(component.navigateToIndex).toHaveBeenCalled();
    expect(service.createBill).toHaveBeenCalledWith(newBill);
  });

  it('aborts editing', fakeAsync(() => {
    const router: Router = TestBed.get(Router);
    fixture.detectChanges();
    spyOn(router, 'navigate').and.returnValue('');
    const compiled = fixture.debugElement.nativeElement;
    component.navigateToIndex();
    expect(router.navigate).toHaveBeenCalledWith(['bills']);
  }));
});
