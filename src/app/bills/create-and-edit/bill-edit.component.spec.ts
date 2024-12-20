import { ComponentFixture, fakeAsync, inject, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { billVariant } from '../bill.mock'
import { BillsService } from '../bills.service'
import { MaterialModule } from './../../material/material.module'
import { Bill } from './../bill'
import { EditedBill } from './../edited-bill'
import { ArticlesFormComponent } from './articles/articles-form.component'
import { ArticlesService } from './articles/articles.service'
import { BillAutocompleteService } from './bill-autocomplete.service'
import { BillEditComponent } from './bill-edit.component'
import { BillFormComponent } from './bill-form.component'
import { type Observable, of } from 'rxjs'

describe('BillEditComponent', () => {
  let component: BillEditComponent
  let fixture: ComponentFixture<BillEditComponent>

  const bill = billVariant({
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
            updateBill: (billToUpdate: EditedBill): void => undefined,
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

  it('submits the form', () => {
    const service: BillsService = TestBed.get(BillsService)
    spyOn(service, 'updateBill')
    const abortSpy = spyOn(component, 'navigateToIndex').and.returnValue()

    const compiled = fixture.debugElement.nativeElement
    const element = compiled.querySelector('form')
    element.dispatchEvent(new Event('submit'))

    const expectedEditedBill = { ...bill } as any
    delete expectedEditedBill.updatedAt
    expect(component.navigateToIndex).toHaveBeenCalled()
    expect(service.updateBill).toHaveBeenCalledWith(expectedEditedBill)
  })

  it('aborts editing', fakeAsync(() => {
    const router: Router = TestBed.get(Router)
    fixture.detectChanges()
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
    const compiled = fixture.debugElement.nativeElement
    component.navigateToIndex()
    expect(router.navigate).toHaveBeenCalledWith(['bills'])
  }))
})
