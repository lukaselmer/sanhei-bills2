import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule, MdCheckboxModule, MdListModule } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { BillsService } from '../bills.service';
import { BillsListComponent } from './bills-list.component';

describe('BillsListComponent', () => {
  let component: BillsListComponent;
  let fixture: ComponentFixture<BillsListComponent>;
  const bills = [
    {
      id: '1234',
      uid: '17071234',
      address1: 'Adresszeile 1',
      address2: 'Adressezeile 2',
      title1: 'Objekt: Adresse',
      title2: 'Zusatz'
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdListModule,
        MdCheckboxModule
      ],
      providers: [
        { provide: BillsService, useValue: { forIndex: () => Observable.of(bills) } }
      ],
      declarations: [BillsListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render an md-list', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-list')).not.toBe(null);
  }));

  it('should render a row for each bill', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-list > md-list-item').childElementCount).toBe(bills.length);
  }));

  it('should render the row for the bill', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const bill = bills[0];
    const element = compiled.querySelector(`md-list-item#bill_${bill.id}`);
    expect(element).not.toBe(null);
    expect(element.querySelector('[md-line]:nth-child(2)').textContent.trim()).toEqual(bill.id);

    const billTitle = `${bill.uid} ${bill.address1}, ${bill.address2}, ${bill.title1}, ${bill.title2}`;
    expect(element.querySelector('[md-line]:nth-child(3)').textContent.trim()).toEqual(billTitle);
  }));
});
