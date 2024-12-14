import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { type Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { currentDateAsISO8601WithoutDays } from '../../shared/date-helper'
import { Bill, billDefaults } from './../bill'
import { BillAutocompleteService } from './bill-autocomplete.service'
import { dateValidator } from './validators/date-validator.directive'
import { workedAtValidator } from './validators/worked-at-validator.directive'

@Component({
  selector: 'sb-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss'],
  standalone: false,
})
export class BillFormComponent implements OnChanges {
  @Input() bill: Bill | undefined
  @Input() createNewBill: boolean | undefined

  /**
   * Emits the valid form value once
   */
  @Output() submitted = new EventEmitter<any>()
  @Output() aborted = new EventEmitter<void>()

  form: FormGroup | undefined
  autocompleteOptions: {
    [index: string]: Observable<string[]>
  } = {}

  private get initializedForm(): FormGroup {
    if (!this.form) throw new Error('this.form is not initilized')
    return this.form
  }

  constructor(
    private readonly autocompleteService: BillAutocompleteService,
    private readonly fb: FormBuilder,
  ) {}

  private createForm() {
    if (this.form) return

    this.form = this.fb.group({
      articles: this.fb.array([]),

      ...this.editSpecificFormValues(),

      cashback: [
        billDefaults.cashback + '',
        Validators.compose([Validators.required, Validators.min(0), Validators.max(100)]),
      ],
      vat: [
        billDefaults.vat + '',
        Validators.compose([Validators.required, Validators.min(1), Validators.max(100)]),
      ],
      discount: [
        billDefaults.discount + '',
        Validators.compose([Validators.required, Validators.min(0), Validators.max(100)]),
      ],
      paymentDeadlineInDays: [
        billDefaults.paymentDeadlineInDays + '',
        Validators.compose([Validators.required, Validators.min(1), Validators.max(1000)]),
      ],

      address: ['', Validators.required],
      billType: ['Rechnung', Validators.required],
      description: '',
      workedAt: ['', workedAtValidator()],
      ordererName: [''],
      ownerName: [''],
      title: ['Objekt: ', Validators.required],
      descriptionTitle: ['', Validators.required],

      orderedAt: [this.dateDefault(), dateValidator()],
      billedAt: ['', dateValidator()],
    })
  }

  private editSpecificFormValues() {
    return this.createNewBill ? {} : { humanId: ['', Validators.required] }
  }

  private dateDefault(): string {
    return currentDateAsISO8601WithoutDays()
  }

  ngOnChanges(changes: SimpleChanges): void {
    const validBillEditValue = changes.bill && changes.bill.currentValue
    if (!this.createNewBill && !validBillEditValue) return

    this.createForm()
    this.initBillAutocomplete()
    this.billChanged()
  }

  private initBillAutocomplete() {
    if (this.autocompleteOptions.title) return

    const fields = [
      'billType',
      'address',
      'title',
      'descriptionTitle',
      'ownerName',
      'ordererName',
      'description',
    ] as const
    fields.forEach(
      (field) =>
        (this.autocompleteOptions[field] = (
          this.initializedForm.get(field) as FormControl
        ).valueChanges.pipe(
          startWith(''),
          map((v) => this.autocompleteService.autocompleteOptions(field, v)),
        )),
    )
  }

  private billChanged() {
    if (!this.bill) return

    const billFormValue = {
      articles: [],
      humanId: this.bill.humanId,
      cashback: this.bill.cashback,
      vat: this.bill.vat,
      discount: this.bill.discount,
      paymentDeadlineInDays: this.bill.paymentDeadlineInDays || billDefaults.paymentDeadlineInDays,
      address: this.bill.address,
      billType: this.bill.billType,
      description: this.bill.description,
      ordererName: this.bill.ordererName,
      ownerName: this.bill.ownerName,
      title: this.bill.title,
      descriptionTitle: this.bill.descriptionTitle,
      workedAt: this.bill.workedAt,
      orderedAt: this.bill.orderedAt,
      billedAt: this.bill.billedAt,
    }
    this.initializedForm.setValue(billFormValue)
  }

  onSubmit() {
    if (this.initializedForm.valid) {
      this.submitted.emit(this.initializedForm.value)
      this.submitted.complete()
    } else this.resetScrollPosition()
  }

  private resetScrollPosition() {
    // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
    this.scrollToAndFocus('.mat-input-element.ng-touched.ng-invalid') ||
      this.scrollToAndFocus('.mat-input-element.ng-invalid') ||
      window.scrollTo(0, 0)
  }

  private scrollToAndFocus(query: string): boolean {
    const element = document.querySelector(query) as HTMLElement
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
      setTimeout(() => element.focus(), 500)
    }
    return !!element
  }

  abort() {
    this.aborted.emit()
    this.aborted.complete()
    return false
  }

  descriptionTitleSelected(event: MatAutocompleteSelectedEvent) {
    const descriptionControl = this.initializedForm.controls.description
    if (descriptionControl.value) return

    const description = this.autocompleteService.descriptionForDescriptionTitle(event.option.value)
    descriptionControl.setValue(description)
  }

  addressSelected(event: MatAutocompleteSelectedEvent) {
    const discountControl = this.initializedForm.controls.discount
    const paymentDeadlineControl = this.initializedForm.controls.paymentDeadlineInDays

    const bill = this.autocompleteService.billForAddress(event.option.value)
    if (!bill) return

    discountControl.setValue(bill.discount + '')
    paymentDeadlineControl.setValue(
      (bill.paymentDeadlineInDays || billDefaults.paymentDeadlineInDays) + '',
    )
  }

  titleSelected(event: MatAutocompleteSelectedEvent) {
    const addressControl = this.initializedForm.controls.address
    const ownerNameControl = this.initializedForm.controls.ownerName
    const discountControl = this.initializedForm.controls.discount
    const paymentDeadlineControl = this.initializedForm.controls.paymentDeadlineInDays

    const bill = this.autocompleteService.billForTitle(event.option.value)
    if (!bill) return
    if (!addressControl.value) addressControl.setValue(bill.address)
    if (!ownerNameControl.value) ownerNameControl.setValue(bill.ownerName)
    if (discountControl.value === billDefaults.discount + '')
      discountControl.setValue(bill.discount + '')

    if (paymentDeadlineControl.value === billDefaults.paymentDeadlineInDays + '') {
      paymentDeadlineControl.setValue(
        (bill.paymentDeadlineInDays || billDefaults.paymentDeadlineInDays) + '',
      )
    }
  }
}
