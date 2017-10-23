import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Bill } from './../bill';
import { BillsService } from './../bills.service';
import { EditedBill } from './../edited-bill';
import { BillEditFormExtractor } from './bill-edit-form-extractor';

@Component({
  selector: 'sb-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit {
  id: string;
  bill: Bill;
  submitted = false;

  constructor(private router: Router, route: ActivatedRoute, private billsService: BillsService) {
    this.id = route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach(bill => this.billChanged(bill));
  }

  private billChanged(bill: Bill) {
    if (this.submitted) return;
    this.bill = bill;
  }

  saveBill(validFormValue: any) {
    const extractor = new BillEditFormExtractor(validFormValue, this.bill);
    this.submitted = true;
    this.billsService.updateBill(extractor.extractBill());
    this.navigateToIndex();
  }

  navigateToIndex() {
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
  }
}
