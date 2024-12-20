import { ComponentFixture, fakeAsync, inject, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { billVariant } from '../bill.mock'
import { BillsService } from '../bills.service'
import { MaterialModule } from './../../material/material.module'
import { Bill } from './../bill'
import { ArticlesFormComponent } from './articles/articles-form.component'
import { ArticlesService } from './articles/articles.service'
import { BillAutocompleteService } from './bill-autocomplete.service'
import { BillEditComponent } from './bill-edit.component'
import { BillFormComponent } from './bill-form.component'
import { of, type Observable } from 'rxjs'

describe('BillFormComponent', () => {
  let component: BillEditComponent
  let fixture: ComponentFixture<BillEditComponent>

  const bill = billVariant({
    id: '1234',
    uid: 17071234,
    address: 'Adresszeile 1\nAdressezeile 2',
    title: 'Objekt: Adresse',
    descriptionTitle: 'Zusatz',
  })

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule, RouterTestingModule],
      providers: [
        {
          provide: BillsService,
          useValue: {
            editBill: (id: string): Observable<Bill> => {
              expect(id).toEqual(bill.id)
              return of(bill)
            },
            updateBill: (billToUpdate: Bill): void => undefined,
          },
        },
        {
          provide: BillAutocompleteService,
          useValue: {
            autocompleteOptions: () => [],
          },
        },
        {
          provide: ArticlesService,
          useValue: {
            filterAutocompleteArticles: () => [],
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: bill.id,
              },
            },
          },
        },
      ],
      declarations: [BillEditComponent, BillFormComponent, ArticlesFormComponent],
    }).compileComponents()
  }))

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(BillEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    tick(1)
  }))

  it('renders the form fields and sets the values', () => {
    const compiled = fixture.debugElement.nativeElement
    function selectField(formControlName: string): HTMLInputElement {
      return compiled.querySelector(`[formControlName=${formControlName}]`)
    }

    function selectTextarea(formControlName: string): HTMLTextAreaElement {
      return compiled.querySelector(`textarea[formControlName=${formControlName}]`)
    }

    expect(selectField('cashback').value).toEqual(bill.cashback + '')
    expect(selectField('vat').value).toEqual(bill.vat + '')
    expect(selectField('discount').value).toEqual(bill.discount + '')
    expect(selectField('billType').value).toEqual(bill.billType)
    expect(selectField('ordererName').value).toEqual(bill.ordererName)
    expect(selectField('ownerName').value).toEqual(bill.ownerName)
    expect(selectField('title').value).toEqual(bill.title)
    expect(selectField('descriptionTitle').value).toEqual(bill.descriptionTitle)
    expect(selectField('orderedAt').value).toEqual(bill.orderedAt)
    expect(selectField('billedAt').value).toEqual(bill.billedAt)
    expect(selectField('workedAt').value).toEqual(bill.workedAt)
    expect(selectTextarea('address').value).toEqual(bill.address)
    expect(selectTextarea('description').value).toEqual(bill.description)
  })
})
