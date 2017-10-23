import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Bill } from './../bill';
import { BillsService } from './../bills.service';

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

  saveBill(bill: Bill) {
    this.submitted = true;
    this.billsService.updateBill(bill);
    this.navigateToIndex();
  }

  navigateToIndex() {
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
  }
}
