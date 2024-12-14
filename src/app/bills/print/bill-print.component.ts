import { DecimalPipe } from '@angular/common'
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { dateOrEmpty, stringToDate } from '../../shared/date-helper'
import { BillView } from './../bill-view'
import { BillsService } from './../bills.service'

@Component({
  selector: 'sb-bill-print',
  templateUrl: './bill-print.component.html',
  styleUrls: ['./bill-print.component.scss'],
  standalone: false,
})
export class BillPrintComponent implements OnInit {
  private static readonly PAGE_BREAK_AFTER = 1220
  private static readonly HEADER_AND_SUBTOTAL_HEIGHT = 270
  private static readonly TOTALS_HEIGHT = 145

  currentPage = 0
  currentPageOffset = 0
  id: string
  billView: BillView | undefined

  constructor(
    private readonly router: Router,
    route: ActivatedRoute,
    private readonly billsService: BillsService,
    private readonly element: ElementRef,
    private readonly renderer: Renderer2,
    private readonly decimalPipe: DecimalPipe,
  ) {
    this.id = route.snapshot.params.id
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach((bill) => {
      if (bill) {
        this.billView = new BillView(bill)
        this.billsService.markAsPrinted(bill)
        this.insertPageBreaks()
      }
    })
  }

  // region page breaks

  private insertPageBreaks() {
    setTimeout(() => {
      this.currentPageOffset = 0
      this.currentPage = 1
      const articleElements: HTMLDivElement[] = Array.from(
        this.element.nativeElement.querySelectorAll('.article'),
      )

      articleElements.forEach((articleEl, index) => {
        const spaceUsed = articleEl.offsetTop - this.currentPageOffset
        const isLastArticle = index === articleElements.length - 1
        const notEnoughSpaceForArticles = spaceUsed > BillPrintComponent.PAGE_BREAK_AFTER
        const notEnoughSpaceForTotals =
          isLastArticle &&
          spaceUsed > BillPrintComponent.PAGE_BREAK_AFTER - BillPrintComponent.TOTALS_HEIGHT

        if (notEnoughSpaceForArticles || notEnoughSpaceForTotals) this.handlePageBreak(articleEl, index)
      })
    }, 10)
  }

  private handlePageBreak(articleView: HTMLDivElement, index: number) {
    const parent = this.renderer.parentNode(articleView)
    this.renderer.insertBefore(parent, this.createSubtotalEl(index, 'subtotal-end'), articleView)

    this.currentPage++

    this.renderer.insertBefore(parent, this.createHeader(), articleView)
    this.renderer.insertBefore(parent, this.createSubtotalEl(index, 'subtotal-start'), articleView)

    this.currentPageOffset = articleView.offsetTop - BillPrintComponent.HEADER_AND_SUBTOTAL_HEIGHT
  }

  private createSubtotalEl(upToArticle: number, className: string): HTMLDivElement {
    const subtotalEl = this.createDiv('')
    this.renderer.appendChild(subtotalEl, this.createDiv('Übertrag'))
    this.renderer.appendChild(subtotalEl, this.createDiv(this.calculateSubtotal(upToArticle) + ''))
    this.renderer.addClass(subtotalEl, className)
    return subtotalEl
  }

  private calculateSubtotal(upToArticle: number): string {
    if (!this.billView) throw new Error('this.billView is not initilized')
    const articles = this.billView.articles.slice(0, upToArticle)
    const subtotal = Math.round(20 * articles.reduce((sum, current) => sum + current.totalPrice, 0)) / 20
    return this.decimalPipe.transform(subtotal, '1.2-2') as string
  }

  private createHeader(): HTMLDivElement {
    if (!this.billView) throw new Error('this.billView is not initilized')

    const headerEl: HTMLDivElement = this.renderer.createElement('div')
    this.renderer.addClass(headerEl, 'page-header')
    this.renderer.appendChild(
      headerEl,
      this.createHeaderLine(
        `${this.billView.billType} ${this.billView.uid}`,
        this.billView.billedAtDate?.toLocaleDateString?.('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) ?? '',
      ),
    )
    this.renderer.appendChild(
      headerEl,
      this.createHeaderLine(this.billView.title, `Seite ${this.currentPage}`),
    )
    return headerEl
  }

  private createHeaderLine(textLeft: string, textRight: string): HTMLDivElement {
    const el: HTMLDivElement = this.renderer.createElement('div')
    this.renderer.appendChild(el, this.createSpan(textLeft))
    this.renderer.appendChild(el, this.createSpan(textRight))
    return el
  }

  private createDiv(text: string): HTMLDivElement {
    return this.createElementWithText<HTMLDivElement>('div', text)
  }

  private createSpan(text: string): HTMLSpanElement {
    return this.createElementWithText<HTMLSpanElement>('span', text)
  }

  private createElementWithText<T>(elementName: 'span' | 'div', text: string): T {
    const spanEl: T = this.renderer.createElement(elementName)
    if (text) this.renderer.appendChild(spanEl, this.renderer.createText(text))
    return spanEl
  }

  // endregion

  isDate(dateOrString: string): string {
    return dateOrEmpty(dateOrString)
  }

  parseDate(dateString: string): Date {
    return stringToDate(dateString)
  }
}
