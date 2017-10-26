import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillView } from './../bill-view';
import { BillsService } from './../bills.service';

@Component({
  selector: 'sb-bill-print',
  templateUrl: './bill-print.component.html',
  styleUrls: ['./bill-print.component.scss']
})
export class BillPrintComponent implements OnInit {
  id: string;
  billView: BillView;

  constructor(private router: Router, route: ActivatedRoute, private billsService: BillsService) {
    this.id = route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach(bill => {
      if (bill) {
        this.billView = new BillView(bill);
        this.billsService.markAsPrinted(bill);
      }
    });
  }
}
