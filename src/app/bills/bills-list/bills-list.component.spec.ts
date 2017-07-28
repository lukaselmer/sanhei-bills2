import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { billVariant } from 'app/bills/bill.mock';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { BillEditComponent } from '../bill-edit/bill-edit.component';
import { BillsService } from '../bills.service';
import { SearchResult } from '../search/search-result';
import { Bill } from './../bill';
import { BillForm } from './../bill-form';
import { BillView } from './../bill-view';
import { BillsListComponent } from './bills-list.component';

describe('BillsListComponent', () => {
  let component: BillsListComponent;
  let fixture: ComponentFixture<BillsListComponent>;
  const bill = billVariant({
    id: 1234,
    uid: 17071234,
    address1: 'Adresszeile 1',
    address2: 'Adressezeile 2',
    title1: 'Objekt: Adresse',
    title2: 'Zusatz'
  });
  const billView = new BillView(bill);
  const billForm = new BillForm(bill);
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
        {
          provide: BillsService, useValue: {
            search: (): Observable<SearchResult<Bill>> => Observable.of(billsSearch),
            editBill: (): Observable<BillForm> => Observable.of(billForm)
          }
        }
      ],
      declarations: [BillsListComponent, BillEditComponent]
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
    const element = compiled.querySelector('md-list-item');
    expect(element).not.toBe(null);

    function line(lineNumber: number): string {
      return element.querySelector(`[md-line]:nth-child(${lineNumber})`).textContent.trim();
    }

    expect(line(1)).toEqual(`${bill.uid} | ${bill.id}`);
    expect(line(2)).toEqual(`${billView.commaSeparatedAddress}`);
    expect(line(3)).toEqual(`${billView.title1}, ${billView.title2}`);
    expect(line(4)).toEqual('Arbeiten am: 2017-06-21 | Jun 23, 2017');
    expect(line(5)).toEqual('Verrechnet am: 2017-06-23 | Jun 23, 2017');
    expect(line(6)).toEqual(`${bill.ownerName}, ${bill.ordererName}, ${bill.worker}`);
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

  describe('edit', () => {
    it('should edit a bill', fakeAsync(inject([BillsService], (service: BillsService) => {
      expect(component.editingBill).toBeUndefined();
      spyOn(service, 'editBill').and.callThrough();
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const element = compiled.querySelector('md-list-item');
      element.dispatchEvent(new Event('click'));
      expect(service.editBill).toHaveBeenCalledWith(bill.id);
      if (!component.editingBill) {
        fail('component.editingBill should be defined');
      } else {
        component.editingBill.subscribe(bf => expect(bf).toBe(billForm));
      }
    })));

    it('should render the edit mask if a bill is editable', fakeAsync(inject([BillsService], (service: BillsService) => {
      expect(component.editingBill).toBeUndefined();
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.querySelector('sb-bill-edit')).toBeFalsy();

      component.editBill(billView);

      fixture.detectChanges();
      const element = fixture.debugElement.nativeElement.querySelector('sb-bill-edit');
      expect(element).toBeTruthy();
    })));
  });
});
