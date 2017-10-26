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
import { BillsListComponent } from './bills-list/bills-list.component';
import { BillsRoutingModule } from './bills-routing.module';
import { BillsService } from './bills.service';
import { ArticlesFormComponent } from './create-and-edit/articles/articles-form.component';
import { ArticlesService } from './create-and-edit/articles/articles.service';
import { BillAutocompleteService } from './create-and-edit/bill-autocomplete.service';
import { BillEditComponent } from './create-and-edit/bill-edit.component';
import { BillFormComponent } from './create-and-edit/bill-form.component';
import { BillNewComponent } from './create-and-edit/bill-new.component';
import { BillPrintComponent } from './print/bill-print.component';
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
    BillFormComponent,
    BillNewComponent,
    ArticlesFormComponent,
    BillPrintComponent
  ],
  exports: [BillsListComponent],
  providers: [
    BillMatcherFactory,
    BillsService,
    ArticlesService,
    DataStoreService,
    IDBStoreService,
    BillAutocompleteService
  ]
})
export class BillsModule {}
