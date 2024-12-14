import { ComponentFixture, fakeAsync, inject, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { billVariant } from '../bill.mock'
import { BillsService } from '../bills.service'
import { SearchResult } from '../search/search-result'
import { MaterialModule } from './../../material/material.module'
import { Bill } from './../bill'
import { BillView } from './../bill-view'
import { BillsListComponent } from './bills-list.component'
import { of, type Observable } from 'rxjs'

describe('BillsListComponent', () => {
  let component: BillsListComponent
  let fixture: ComponentFixture<BillsListComponent>
  const bill = billVariant({
    address: 'Adresszeile 1\nAdressezeile 2',
    title: 'Objekt: Adresse',
    descriptionTitle: 'Zusatz',
  })
  const billView = new BillView(bill)
  const bills = [bill, bill, bill, bill, bill, bill, bill, bill, bill, bill, bill]
  const billsSearch = {
    term: '',
    list: bills,
    dbStatus: 'loaded' as const,
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          {
            path: 'bills',
            component: BillsListComponent,
          },
        ]),
      ],
      providers: [
        {
          provide: BillsService,
          useValue: {
            search: (): Observable<SearchResult<Bill>> => of(billsSearch),
            editBill: (): Observable<Bill> => of(bill),
          },
        },
      ],
      declarations: [BillsListComponent],
    }).compileComponents()
  }))

  describe('construction', () => {
    it('reads the params from the activated route', fakeAsync(() => {
      const router: Router = TestBed.get(Router)
      const service: BillsService = TestBed.get(BillsService)
      spyOn(service, 'search').and.callThrough()
      router.navigate(['/bills'], {
        queryParams: {
          q: 'some',
          limit: 77,
        },
      })
      fixture = TestBed.createComponent(BillsListComponent)
      component = fixture.componentInstance
      tick()
      fixture.detectChanges()
      tick(100)
      expect(service.search).toHaveBeenCalledWith({
        term: 'some',
        limit: 77,
      })
      expect((component as any).searchTermStream.getValue()).toEqual({
        term: 'some',
        limit: 77,
      })
    }))
  })

  describe('behaviour', () => {
    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BillsListComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      tick(100)
    }))

    it('should be created', () => {
      expect(component).toBeTruthy()
    })

    it('should render the search field', waitForAsync(() => {
      fixture.detectChanges()
      const compiled = fixture.debugElement.nativeElement
      expect(compiled.querySelector('mat-form-field')).not.toBe(null)
    }))

    it('should render a row for each bill', fakeAsync(() => {
      fixture.detectChanges()
      const compiled: HTMLElement = fixture.debugElement.nativeElement
      expect(compiled.querySelectorAll('mat-card').length).toBe(bills.length + 1)
    }))

    it('should render the row for the bill', fakeAsync(() => {
      fixture.detectChanges()
      const compiled = fixture.debugElement.nativeElement
      const element = compiled.querySelector('mat-card')
      expect(element).not.toBe(null)

      function line(lineNumber: number): string {
        return element.querySelector(`[md-line]:nth-child(${lineNumber})`).textContent.trim()
      }

      function queryContent(query: string): string {
        return element.querySelector(query).textContent.trim()
      }

      expect(queryContent('mat-card-title')).toEqual(`${bill.uid} | ${bill.humanId}`)
      expect(queryContent('mat-card-subtitle :first-child')).toEqual(
        `${billView.title}, ${billView.descriptionTitle}`,
      )
      expect(queryContent('mat-card-subtitle :last-child')).toEqual(billView.addressView.commaSeparated)
      expect(queryContent('mat-card-content :nth-child(1)')).toEqual('Arbeiten am: 2017-06-20 |')
      expect(queryContent('mat-card-content :nth-child(2)')).toEqual('Verrechnet am: 2017-06-22 |')
      expect(queryContent('mat-card-content :nth-child(3)')).toEqual(
        'CHF750.00 netto | CHF733.65 brutto',
      )
      expect(queryContent('mat-card-content :nth-child(4)')).toEqual(
        `${bill.ownerName}, ${bill.ordererName}`,
      )
    }))

    it('should search through the bills', fakeAsync(() => {
      const router: Router = TestBed.get(Router)
      fixture.detectChanges()
      expect((component as any).searchTermStream.getValue()).toEqual({
        term: '',
        limit: 10,
      })
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
      const compiled = fixture.debugElement.nativeElement
      const element = compiled.querySelector('input')
      element.value = 'Some'
      element.dispatchEvent(new Event('keyup'))
      expect(router.navigate).toHaveBeenCalledWith(['/bills'], {
        queryParams: { q: 'some' },
      })
    }))

    it('should load more bills', fakeAsync(() => {
      fixture.detectChanges()
      const router: Router = TestBed.get(Router)
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
      const compiled = fixture.debugElement.nativeElement
      const element = compiled.querySelector('.load-more button')
      element.dispatchEvent(new Event('click'))
      expect(router.navigate).toHaveBeenCalledWith(['/bills'], {
        queryParams: { limit: 30 },
      })
    }))

    it('should edit the bills', fakeAsync(() => {
      const router: Router = TestBed.get(Router)
      fixture.detectChanges()
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
      const compiled = fixture.debugElement.nativeElement
      const element = compiled.querySelector('.bill mat-card-title')
      element.dispatchEvent(new Event('click'))
      expect(router.navigate).toHaveBeenCalledWith(['bills', 'RaNdOm1000'])
    }))
  })
})
