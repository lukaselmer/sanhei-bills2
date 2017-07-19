import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { BillsService } from 'app/bills/bills.service';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Bill } from './../bill';

@Component({
  selector: 'sb-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss']
})

export class BillsListComponent implements OnInit {
  bills: Observable<Bill[]>;

  constructor(private db: AngularFireDatabase, private router: Router, private billsService: BillsService) { }

  ngOnInit() {
    this.bills = this.billsService.forIndex();
  }
  onSelect(bill: Bill) {
    this.router.navigate(['/bills', bill.id]);
  }
}
