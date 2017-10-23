import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Bill } from './../bill';
import { BillsService } from './../bills.service';

@Component({
  selector: 'sb-bill-print',
  templateUrl: './bill-print.component.html',
  styleUrls: ['./bill-print.component.scss']
})
export class BillPrintComponent implements OnInit {
  id: string;
  bill: Bill;

  constructor(private router: Router, route: ActivatedRoute, private billsService: BillsService) {
    this.id = route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach(bill => this.bill = bill);
  }
}
