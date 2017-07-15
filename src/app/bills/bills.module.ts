import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdCheckboxModule, MdListModule } from '@angular/material';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsService } from './bills.service';

@NgModule({
  imports: [
    CommonModule,
    MdListModule,
    MdCheckboxModule
  ],
  declarations: [
    BillsListComponent
  ],
  exports: [
    BillsListComponent
  ],
  providers: [
    BillsService
  ]
})
export class BillsModule { }
