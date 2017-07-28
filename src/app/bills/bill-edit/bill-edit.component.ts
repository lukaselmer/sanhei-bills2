import { Component, OnInit } from '@angular/core';
import { BillsService } from 'app/bills/bills.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { DataStoreStatus } from '../store/data-store-status';
import { Bill } from './../bill';
import { BillForm } from './../bill-form';
import { BillView } from './../bill-view';
import { SearchResult } from './../search/search-result';

@Component({
  selector: 'sb-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent {
}
