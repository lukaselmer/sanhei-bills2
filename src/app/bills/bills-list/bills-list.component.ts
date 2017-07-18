import { Component, OnInit } from '@angular/core';
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

  constructor(private billsService: BillsService) { }

  ngOnInit() {
    this.bills = this.billsService.forIndex();
  }
}
