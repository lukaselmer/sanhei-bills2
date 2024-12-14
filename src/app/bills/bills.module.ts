import { CommonModule, DecimalPipe } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MaterialModule } from './../material/material.module'
import { BillsListComponent } from './bills-list/bills-list.component'
import { BillsRoutingModule } from './bills-routing.module'
import { BillsService } from './bills.service'
import { ArticlesFormComponent } from './create-and-edit/articles/articles-form.component'
import { ArticlesService } from './create-and-edit/articles/articles.service'
import { BillAutocompleteService } from './create-and-edit/bill-autocomplete.service'
import { BillEditComponent } from './create-and-edit/bill-edit.component'
import { BillFormComponent } from './create-and-edit/bill-form.component'
import { BillNewComponent } from './create-and-edit/bill-new.component'
import { BillPrintComponent } from './print/bill-print.component'
import { BillMatcherFactory } from './search/bill-matcher.factory'
import { DataStoreService } from './store/data-store.service'
import { IDBStoreService } from './store/idb-store.service'
import { FirebaseDbService } from './store/firebase-db.service'

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, BillsRoutingModule],
  declarations: [
    BillsListComponent,
    BillEditComponent,
    BillFormComponent,
    BillNewComponent,
    ArticlesFormComponent,
    BillPrintComponent,
  ],
  exports: [BillsListComponent],
  providers: [
    DecimalPipe,
    BillMatcherFactory,
    BillsService,
    ArticlesService,
    DataStoreService,
    IDBStoreService,
    FirebaseDbService,
    BillAutocompleteService,
  ],
})
export class BillsModule {}
