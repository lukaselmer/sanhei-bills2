import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Bill } from './../bill'
import { BillsService } from './../bills.service'
import { EditedBill } from './../edited-bill'
import { BillEditFormExtractor } from './bill-edit-form-extractor'

@Component({
  selector: 'sb-bill-edit',
  templateUrl: './bill-edit.component.html',
})
export class BillEditComponent implements OnInit {
  id: string
  bill: Bill | undefined
  submitted = false

  constructor(
    private readonly router: Router,
    route: ActivatedRoute,
    private readonly billsService: BillsService
  ) {
    this.id = route.snapshot.params.id
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach((bill) => this.billChanged(bill))
  }

  private billChanged(bill: Bill) {
    if (this.submitted) return
    this.bill = bill
  }

  saveBill(validFormValue: any) {
    if (!this.bill) throw new Error('this.bill is not initilized')
    const extractor = new BillEditFormExtractor(validFormValue, this.bill)
    this.submitted = true
    this.billsService.updateBill(extractor.extractBill())
    this.navigateToIndex()
  }

  navigateToIndex() {
    this.router.navigate(['bills'])
    window.scrollTo(0, 0)
  }
}
