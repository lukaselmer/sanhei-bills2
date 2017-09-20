import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { DataStoreStatus } from '../store/data-store-status';
import { Bill } from './../bill';
import { BillView } from './../bill-view';
import { BillsService } from './../bills.service';
import { SearchResult } from './../search/search-result';

@Component({
  selector: 'sb-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit {
  id: number;
  form: FormGroup;
  bill: Bill;

  constructor(router: ActivatedRoute, private billsService: BillsService, private fb: FormBuilder) {
    this.id = +router.snapshot.params['id'];
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      cashback: '',
      vat: ['',
        Validators.compose([
          Validators.required,
          Validators.min(1)]
        )
      ],
      workHours: '',

      finished: '',
      paid: '',
      deleted: '',

      address: ['', Validators.required],
      billType: ['', Validators.required],
      description: '',
      fixedAtOverride: '',
      ordererName: ['', Validators.required],
      ownerName: ['', Validators.required],
      title1: ['', Validators.required],
      title2: ['', Validators.required],
      worker: ['', Validators.required],

      fixedAt: ['', Validators.required],
      orderedAt: '',
      billedAt: ''
    });
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach(bill => this.billChanged(bill));
  }

  private billChanged(bill: Bill) {
    this.bill = bill;
    const billFormValue = {
      cashback: bill.cashback,
      vat: bill.vat,
      workHours: bill.workHours,
      finished: bill.finished,
      paid: bill.paid,
      deleted: bill.deleted,
      address: [
        bill.address1,
        bill.address2,
        bill.address3,
        bill.address4,
        bill.address5
      ].join('\n').trim(),
      billType: bill.billType,
      description: bill.description,
      fixedAtOverride: bill.fixedAtOverride,
      ordererName: bill.ordererName,
      ownerName: bill.ownerName,
      title1: bill.title1,
      title2: bill.title2,
      worker: bill.worker,
      fixedAt: bill.fixedAt,
      orderedAt: bill.orderedAt,
      billedAt: bill.billedAt
    };
    this.form.setValue(billFormValue);
  }

  onSubmit() {
    // TODO: implement this
  }
}
