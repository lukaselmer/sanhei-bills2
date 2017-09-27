import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { articleVariant } from '../article.mock';
import { billArticleVariant } from '../bill-article.mock';
import { billVariant } from '../bill.mock';
import { BillsService } from '../bills.service';
import { SearchResult } from '../search/search-result';
import { Bill } from './../bill';
import { BillView } from './../bill-view';
import { BillsListComponent } from './bills-list.component';

describe('BillsListComponent', () => {
  let component: BillsListComponent;
  let fixture: ComponentFixture<BillsListComponent>;
  const bill = billVariant({
    address: 'Adresszeile 1\nAdressezeile 2',
    title1: 'Objekt: Adresse',
    title2: 'Zusatz'
  });
  const billView = new BillView(bill,
    [billArticleVariant()],
    [articleVariant()]);
  const bills = [bill];
  const billsSearch = {
    term: '',
    list: bills,
    dbStatus: 'loaded' as 'loaded'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdCheckboxModule,
        MdInputModule,
        MdListModule,
        MdProgressBarModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: BillsService, useValue: {
            search: (): Observable<SearchResult<Bill>> => Observable.of(billsSearch),
            editBill: (): Observable<Bill> => Observable.of(bill),
            billArticlesForBill: () => [billArticleVariant()],
            articlesForBillArticles: () => [articleVariant()]
          }
        }
      ],
      declarations: [BillsListComponent]
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(BillsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(100);
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render a md-card', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-form-field')).not.toBe(null);
  }));

  it('should render a row for each bill', fakeAsync(() => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('md-card').length).toBe(bills.length);
  }));

  it('should render the row for the bill', fakeAsync(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('md-card');
    expect(element).not.toBe(null);

    function line(lineNumber: number): string {
      return element.querySelector(`[md-line]:nth-child(${lineNumber})`).textContent.trim();
    }

    function queryContent(query: string): string {
      return element.querySelector(query).textContent.trim();
    }

    expect(queryContent('md-card-title')).toEqual(`${bill.uid} | ${bill.id}`);
    expect(queryContent('md-card-subtitle :first-child')).toEqual(`${billView.title1}, ${billView.title2}`);
    expect(queryContent('md-card-subtitle :last-child')).toEqual(billView.commaSeparatedAddress);
    expect(queryContent('md-card-content :nth-child(1)')).toEqual(`Arbeiten am: fixedAtOverride |`);
    expect(queryContent('md-card-content :nth-child(2)')).toEqual(`Verrechnet am: 2017-06-22 |`);
    expect(queryContent('md-card-content :nth-child(3)')).toEqual(`CHF750.00 netto | CHF735.10 brutto`);
    expect(queryContent('md-card-content :nth-child(4)')).toEqual(`${bill.ownerName}, ${bill.ordererName}`);
  }));

  it('should search through the bills', fakeAsync(inject([BillsService], (service: BillsService) => {
    expect((component as any).searchTermStream.getValue()).toEqual('');
    spyOn(service, 'search').and.callThrough();
    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('input');
    expect(service.search).toHaveBeenCalledTimes(0);
    element.value = 'Some';
    element.dispatchEvent(new Event('keyup'));
    tick(100);
    expect((component as any).searchTermStream.getValue()).toEqual('some');
    expect(service.search).toHaveBeenCalledWith('some');
  })));
});
