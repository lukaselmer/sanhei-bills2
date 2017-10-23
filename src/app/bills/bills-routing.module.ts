import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillEditComponent } from './create-and-edit/bill-edit.component';

const routes: Routes = [
  {
    path: 'bills', children: [
      { path: '', component: BillsListComponent },
      { path: ':id', component: BillEditComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class BillsRoutingModule { }
