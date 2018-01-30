import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Bill } from './../bill';
import { BillsService } from './../bills.service';
import { NewBill } from './../new-bill';
import { BillNewFormExtractor } from './bill-new-form-extractor';

@Component({
  selector: 'sb-bill-new',
  templateUrl: './bill-new.component.html',
  styleUrls: ['./bill-new.component.scss']
})
export class BillNewComponent {
  constructor(private readonly router: Router, private readonly billsService: BillsService) {}

  createBill(validFormValue: any) {
    const extractor = new BillNewFormExtractor(validFormValue);
    this.billsService.createBill(extractor.extractBill());
    this.navigateToIndex();
  }

  navigateToIndex() {
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
  }
}
