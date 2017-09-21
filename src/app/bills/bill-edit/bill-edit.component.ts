import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Bill } from './../bill';
import { BillsService } from './../bills.service';

@Component({
  selector: 'sb-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit {
  id: number;
  form: FormGroup;
  bill: Bill;

  constructor(private router: Router, route: ActivatedRoute, private billsService: BillsService, private fb: FormBuilder) {
    this.id = +route.snapshot.params['id'];
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
      discount: '',

      finished: '',
      paid: '',
      deleted: '',

      address: ['', Validators.required],
      billType: ['', Validators.required],
      description: '',
      fixedAtDescription: ['', Validators.required],
      ordererName: ['', Validators.required],
      ownerName: ['', Validators.required],
      title1: ['', Validators.required],
      title2: ['', Validators.required],
      worker: ['', Validators.required],

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
      discount: bill.discount,
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
      ordererName: bill.ordererName,
      ownerName: bill.ownerName,
      title1: bill.title1,
      title2: bill.title2,
      worker: bill.worker,
      fixedAtDescription: bill.fixedAtOverride.length > 0 ?
        bill.fixedAtOverride :
        bill.fixedAt,
      orderedAt: bill.orderedAt,
      billedAt: bill.billedAt
    };
    this.form.setValue(billFormValue);
  }

  onSubmit() {
    console.log('submit');
    // TODO: implement this
    // combine fixedAtOverride / fixedAt
  }

  abort() {
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
    return false;
  }
}
