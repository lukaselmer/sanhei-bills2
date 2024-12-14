import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { BillsService } from './../bills.service'
import { BillNewFormExtractor } from './bill-new-form-extractor'

@Component({
  selector: 'sb-bill-new',
  templateUrl: './bill-new.component.html',
  standalone: false,
})
export class BillNewComponent {
  constructor(
    private readonly router: Router,
    private readonly billsService: BillsService,
  ) {}

  createBill(validFormValue: any) {
    const extractor = new BillNewFormExtractor(validFormValue)
    this.billsService.createBill(extractor.extractBill())
    this.navigateToIndex()
  }

  navigateToIndex() {
    this.router.navigate(['bills'])
    window.scrollTo(0, 0)
  }
}
