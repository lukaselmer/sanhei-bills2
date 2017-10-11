import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { BillsService } from '../bills.service';
import { DataStoreStatus } from '../store/data-store-status';
import { Bill } from './../bill';
import { BillView } from './../bill-view';
import { SearchOptions } from './../search/search-options';
import { SearchResult } from './../search/search-result';

@Component({
  selector: 'sb-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss']
})
export class BillsListComponent implements OnInit {
  bills$: Observable<BillView[]>;
  displayedSearchTerm = '';
  loadStatus: DataStoreStatus = 'loading';

  private searchTermStream = new BehaviorSubject<SearchOptions>(
    { term: this.displayedSearchTerm, limit: 10 });

  constructor(private billsService: BillsService, private router: Router) { }

  ngOnInit() {
    const billsSearch$ = this.searchTermStream
      .distinctUntilChanged()
      .debounceTime(10)
      .distinctUntilChanged()
      .switchMap(term => this.reallyStartSearching(term))
      .share();
    billsSearch$.subscribe(search => this.updateProgress(search));
    this.bills$ = billsSearch$.map(search => search.list.map(bill => new BillView(bill)));
  }

  private reallyStartSearching(searchOptions: SearchOptions): Observable<SearchResult<Bill>> {
    if (this.displayedSearchTerm !== searchOptions.term) this.loadStatus = 'loading';
    return this.billsService.search(searchOptions);
  }

  private updateProgress(search: SearchResult<Bill>) {
    this.displayedSearchTerm = search.term;
    this.loadStatus = search.dbStatus;
  }

  searchKeyup(searchTerm: string) {
    this.searchTermStream.next({ term: searchTerm.toLowerCase(), limit: 10 });
  }

  editBill(billView: BillView) {
    this.router.navigate(['bills', billView.id]);
    window.scrollTo(0, 0);
    return false;
  }
}
