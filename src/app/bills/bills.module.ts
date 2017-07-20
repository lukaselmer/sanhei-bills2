import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule } from '@angular/material';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsService } from './bills.service';
import { BillMatcherFactory } from './search/bill-matcher.factory';
import { DataStoreService } from './store/data-store.service';
import { IDBStoreService } from './store/idb-store.service';

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
    BillMatcherFactory,
    BillsService,
    DataStoreService,
    IDBStoreService
  ]
})
export class BillsModule { }
