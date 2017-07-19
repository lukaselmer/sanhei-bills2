import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'sb-bill-detail',
  templateUrl: './bill-detail.component.html'
})
export class BillDetailComponent implements OnInit {
  ngOnInit(): void {
    console.log('component created');
  }

  constructor(private router: Router) { }
}
