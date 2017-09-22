import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';

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

      // finished: '',
      // paid: '',
      // deleted: '',

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
    if (this.form.valid) {
      this.billsService.updateBill(this.extractValuesFromForm());
      this.abort();
    } else {
      window.scrollTo(0, 0);
    }
  }

  private extractValuesFromForm(): Bill {
    const v = this.form.value;
    return {
      ...this.extractStrings(),
      ...this.extractNumbers(),
      ...this.applyExistingValuesFromBill(),
      ...this.extractDates(),
      ...this.setTimestamps(),
      ...this.extractAddress()
    };
  }

  private extractStrings() {
    const v = this.form.value;
    return {
      billType: v.billType,
      description: v.description,
      ordererName: v.ordererName,
      ownerName: v.ownerName,
      title1: v.title1,
      title2: v.title2,
      worker: v.worker
    };
  }

  private extractNumbers() {
    const v = this.form.value;
    return {
      cashback: parseInt(v.cashback, 10),
      vat: parseInt(v.vat, 10),
      workHours: parseInt(v.workHours, 10),
      discount: parseInt(v.discount, 10)
    };
  }

  private applyExistingValuesFromBill() {
    return {
      uid: this.bill.uid,
      id: this.bill.id,
      finished: this.bill.finished,
      paid: this.bill.paid,
      deleted: this.bill.deleted
    };
  }

  private extractDates() {
    const v = this.form.value;
    return {
      orderedAt: this.dateOrEmpty(v.orderedAt),
      billedAt: this.dateOrEmpty(v.billedAt),
      ...this.extractFixedAt()
    };
  }

  private dateOrEmpty(potentialDate: string) {
    const dateRegexp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    return (potentialDate || '').match(dateRegexp) ? potentialDate : '';
  }

  private extractFixedAt() {
    const fixedAtDescription: string = this.form.value.fixedAtDescription.trim();
    if (this.dateOrEmpty(fixedAtDescription) === '') {
      return { fixedAt: '', fixedAtOverride: fixedAtDescription };
    }
    return { fixedAt: fixedAtDescription, fixedAtOverride: '' };
  }

  private setTimestamps() {
    return {
      createdAt: this.bill.createdAt,
      updatedAt: firebase.database.ServerValue.TIMESTAMP as number
    };
  }

  private extractAddress() {
    const v = this.form.value;
    const address = v.address.split('\n');

    // if (address[5]) {
    //   TODO: error handling
    // }

    return {
      address1: address[0] || '',
      address2: address[1] || '',
      address3: address[2] || '',
      address4: address[3] || '',
      address5: address[4] || ''
    };
  }

  abort() {
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
    return false;
  }
}
