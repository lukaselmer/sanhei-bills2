import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { BillsService } from '../bills.service';
import { SearchResult } from '../search/search-result';
import { Bill } from './../bill';
import { BillsListComponent } from './bills-list.component';

describe('BillsListComponent', () => {
  let component: BillsListComponent;
  let fixture: ComponentFixture<BillsListComponent>;
  const bill: Bill = {
    id: 1234,
    uid: '17071234',
    address1: 'Adresszeile 1',
    address2: 'Adressezeile 2',
    title1: 'Objekt: Adresse',
    title2: 'Zusatz'
  } as any;
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
        NoopAnimationsModule
      ],
      providers: [
        { provide: BillsService, useValue: { search: (): Observable<SearchResult<Bill>> => Observable.of(billsSearch) } }
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

  it('should render an md-list', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-list')).not.toBe(null);
  }));

  it('should render a row for each bill', fakeAsync(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-list > md-list-item').childElementCount).toBe(bills.length);
  }));

  it('should render the row for the bill', fakeAsync(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector(`md-list-item`);
    expect(element).not.toBe(null);
    expect(element.querySelector('[md-line]:nth-child(2)').textContent.trim()).toEqual(bill.id.toString());

    const billTitle = `${bill.uid} ${bill.address1}, ${bill.address2}, ${bill.title1}, ${bill.title2}`;
    expect(element.querySelector('[md-line]:nth-child(3)').textContent.trim()).toEqual(billTitle);
  }));
});
