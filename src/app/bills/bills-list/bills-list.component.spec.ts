import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
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
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AngularFireDatabase, useValue: {
            list: () => {
              return Observable.of(bills)
            }
          }
        },
        { provide: AngularFireAuth, useValue: {} }
      ],
      declarations: [BillsListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render a table', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('table')).not.toBe(null);
  }));

  it('should render the heading for the table', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('table > thead > tr').childElementCount).toBe(3);
  }));

  it('should render a row for each bill', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('table > tbody').childElementCount).toBe(bills.length);
  }));

  it('should render the row for the bill', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const bill = bills[0];
    const element = compiled.querySelector(`tr#bill_${bill.id}`)
    expect(element).not.toBe(null);
    expect(element.querySelector(':nth-child(1)').textContent).toContain(bill.id);

    const billTitle = `${bill.uid} ${bill.address1}, ${bill.address2}, ${bill.title1}, ${bill.title2}`
    expect(element.querySelector(':nth-child(2)').textContent).toContain(billTitle);
  }));
});
