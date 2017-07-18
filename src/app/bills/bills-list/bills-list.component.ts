import { Component, OnInit } from '@angular/core';
import { BillsService } from 'app/bills/bills.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Bill } from './../bill';
import { SearchResult } from './../search/search-result';

@Component({
  selector: 'sb-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss']
})

export class BillsListComponent implements OnInit {
  bills$: Observable<Bill[]>;
  displayedSearchTerm = '';
  showProgress = true;

  private searchTermStream = new BehaviorSubject<string>('');

  constructor(private billsService: BillsService) { }

  ngOnInit() {
    const billsSearch$ = this.searchTermStream
      .distinctUntilChanged()
      .debounceTime(10)
      .distinctUntilChanged()
      .switchMap(term => this.reallyStartSearching(term));
    this.bills$ = billsSearch$.map(search => search.list);
    billsSearch$.subscribe(search => this.updateProgress(search));
  }

  private reallyStartSearching(term: string) {
    if (this.displayedSearchTerm !== term) this.showProgress = true;
    return this.billsService.search(term);
  }

  private updateProgress(search: SearchResult<Bill>) {
    this.displayedSearchTerm = search.term;
    this.showProgress = search.dbStatus !== 'loaded';
  }

  searchKeyup(searchTerm: string) {
    this.searchTermStream.next(searchTerm);
  }
}
