import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule } from '@angular/material';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsService } from './bills.service';

@NgModule({
  imports: [
    CommonModule,
    MdCheckboxModule,
    MdInputModule,
    MdListModule,
    MdProgressBarModule
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
