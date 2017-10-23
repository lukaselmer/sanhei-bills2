import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressBarModule
} from '@angular/material';
import { ArticlesService } from './articles.service';
import { BillEditComponent } from './bill-edit/bill-edit.component';
import { BillFormComponent } from './bill-edit/bill-form.component';
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
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    BillsRoutingModule
  ],
  declarations: [
    BillsListComponent,
    BillEditComponent,
    BillFormComponent
  ],
  exports: [
    BillsListComponent
  ],
  providers: [
    BillMatcherFactory,
    BillsService,
    ArticlesService,
    DataStoreService,
    IDBStoreService
  ]
})
export class BillsModule { }
