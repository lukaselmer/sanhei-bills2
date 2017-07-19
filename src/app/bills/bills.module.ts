import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdCheckboxModule, MdListModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { BillDetailComponent } from './bill-detail/bill-detail.component';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsService } from './bills.service';

const appRoutes: Routes = [
  { path: 'bills', component: BillsListComponent },
  { path: 'bills/:id', component: BillDetailComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    CommonModule,
    MdListModule,
    MdCheckboxModule
  ],
  declarations: [
    BillsListComponent,
    BillDetailComponent
  ],
  exports: [
    BillsListComponent
  ],
  providers: [
    BillsService
  ]
})
export class BillsModule { }
