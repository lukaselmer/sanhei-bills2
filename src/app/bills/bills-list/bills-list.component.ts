import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { debounceTime, distinctUntilChanged, first, map, share, switchMap } from 'rxjs/operators'
import { BehaviorSubject, lastValueFrom, type Observable } from 'rxjs'
import { BillsService } from '../bills.service'
import { DataStoreStatus } from '../store/data-store-status'
import { Bill } from './../bill'
import { BillView } from './../bill-view'
import { SearchOptions } from './../search/search-options'
import { SearchResult } from './../search/search-result'
import { generatePDFBill } from '../../bills/qr-bill/pdf-bill-service'

@Component({
  selector: 'sb-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss'],
  standalone: false,
})
export class BillsListComponent implements OnInit {
  bills$: Observable<BillView[]> | undefined
  displayedSearchTerm = ''
  loadStatus: DataStoreStatus = 'loading'

  private readonly searchTermStream = new BehaviorSubject<SearchOptions>({
    term: this.displayedSearchTerm,
    limit: 10,
  })

  constructor(
    private readonly billsService: BillsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const billsSearch$ = this.searchTermStream.pipe(
      distinctUntilChanged(),
      debounceTime(10),
      distinctUntilChanged(),
      switchMap((term) => this.reallyStartSearching(term)),
      share(),
    )
    billsSearch$.subscribe((search) => this.updateProgress(search))
    this.bills$ = billsSearch$.pipe(
      map((search) => search.list.map((bill) => new BillView(bill))),
      share(),
    )

    this.route.queryParamMap
      .pipe(
        map((params) => {
          const limit = parseInt(params.get('limit') || '10', 10)
          const term = params.get('q') || ''
          this.searchTermStream.next({
            term,
            limit,
          })
        }),
      )
      .subscribe()
  }

  private reallyStartSearching(searchOptions: SearchOptions): Observable<SearchResult<Bill>> {
    if (this.displayedSearchTerm !== searchOptions.term) this.loadStatus = 'loading'

    return this.billsService.search(searchOptions)
  }

  private updateProgress(search: SearchResult<Bill>) {
    this.displayedSearchTerm = search.term
    this.loadStatus = search.dbStatus
  }

  searchKeyup(searchTerm: string) {
    const cleanSearchTerm = searchTerm.toLowerCase().trim()
    const queryParams = cleanSearchTerm === '' ? {} : { q: cleanSearchTerm }
    this.router.navigate(['/bills'], {
      queryParams,
    })
  }

  async copyBill(billView: BillView) {
    const bill = await lastValueFrom(this.billsService.editBill(billView.id).pipe(first()))
    await this.billsService.copyBill(bill)
    return false
  }

  editBill(billView: BillView | Bill) {
    this.router.navigate(['bills', billView.id])
    window.scrollTo(0, 0)
    return false
  }

  async removeBill(billView: BillView) {
    if (!confirm('Wirklich löschen?')) return

    const bill = await lastValueFrom(this.billsService.editBill(billView.id).pipe(first()))
    await this.billsService.deleteBill(bill)
  }

  loadMore() {
    const searchQuery = this.searchTerm === '' ? {} : { q: this.searchTerm }
    this.router.navigate(['/bills'], {
      queryParams: { ...searchQuery, limit: this.searchLimit + 20 },
    })
  }

  get searchTerm(): string {
    return this.searchTermStream.getValue().term
  }

  get searchLimit() {
    return this.searchTermStream.getValue().limit
  }

  async generateQRBill(bill: BillView) {
    await generatePDFBill(bill)
  }
}
