import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule } from '@angular/material';
import { BillEditComponent } from './bill-edit/bill-edit.component';
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsRoutingModule } from './bills-routing.module';
import { BillsService } from './bills.service';
import { BillMatcherFactory } from './search/bill-matcher.factory';
import { DataStoreService } from './store/data-store.service';
import { IDBStoreService } from './store/idb-store.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MdCheckboxModule,
    MdInputModule,
    MdListModule,
    MdProgressBarModule,
    BillsRoutingModule
  ],
  declarations: [
    BillsListComponent,
    BillEditComponent
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
