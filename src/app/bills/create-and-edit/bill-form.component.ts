import { BillAutocompleteService } from './bill-autocomplete.service';
// Remove this as soon as the rule is fixed (current version: 3.2.1),
// see https://github.com/mgechev/codelyzer/releases
/* tslint:disable:no-access-missing-member */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { currentDateAsISO8601WithoutDays } from '../../shared/date-helper';
import { Bill } from './../bill';
import { EditedBill } from './../edited-bill';
import { NewBill } from './../new-bill';
import { BillFormExtractor } from './bill-form-extractor';
import { FormArticle } from './form-article';
import { dateValidator } from './validators/date-validator.directive';
import { numberValidator } from './validators/number-validator.directive';
import { requiredIfOneSiblingHasContent } from './validators/required-if-one-sibling-has-content.directive';
import { workedAtValidator } from './validators/worked-at-validator.directive';

@Component({
  selector: 'sb-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss']
})
export class BillFormComponent implements OnChanges {
  @Input() bill: Bill;
  @Input() createNewBill: boolean;

  /**
   * Emits the valid form value once
   */
  @Output() onSubmitted = new EventEmitter<any>();
  @Output() onAborted = new EventEmitter<void>();

  form: FormGroup;
  autocompleteOptions: { [index: string]: Observable<string[]> } = {};

  constructor(private autocompleteService: BillAutocompleteService, private fb: FormBuilder) { }

  private createForm() {
    if (this.form) return;

    this.form = this.fb.group({
      articles: this.fb.array([]),

      ...this.editSpecificFormValues(),

      cashback: ['2',
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(100)]
        )
      ],
      vat: ['8',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(100)]
        )
      ],
      discount: ['0',
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(100)]
        )
      ],
      paymentDeadlineInDays: [
        Bill.DEFAULTS.paymentDeadlineInDays,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(1000)]
        )
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
      billedAt: [this.dateDefault(), dateValidator()]
    });
  }

  private editSpecificFormValues() {
    return this.createNewBill ? {} : { humanId: ['', Validators.required] };
  }

  private dateDefault(): string {
    return currentDateAsISO8601WithoutDays();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const validBillEditValue = changes.bill && changes.bill.currentValue;
    if (!this.createNewBill && !validBillEditValue) return;

    this.createForm();
    this.initBillAutocomplete();
    this.billChanged();
  }

  private initBillAutocomplete() {
    if (this.autocompleteOptions['title']) return;

    ['billType', 'address', 'title', 'descriptionTitle', 'ownerName', 'ordererName', 'description']
      .forEach(field =>
        this.autocompleteOptions[field] = (this.form.get(field) as FormControl)
          .valueChanges
          .startWith('')
          .map(v => this.autocompleteService.autocompleteOptions(field, v))
      );
  }

  private billChanged() {
    if (!this.bill) return;

    const billFormValue = {
      articles: [],
      humanId: this.bill.humanId,
      cashback: this.bill.cashback,
      vat: this.bill.vat,
      discount: this.bill.discount,
      paymentDeadlineInDays: this.bill.paymentDeadlineInDays || Bill.DEFAULTS.paymentDeadlineInDays,
      address: this.bill.address,
      billType: this.bill.billType,
      description: this.bill.description,
      ordererName: this.bill.ordererName,
      ownerName: this.bill.ownerName,
      title: this.bill.title,
      descriptionTitle: this.bill.descriptionTitle,
      workedAt: this.bill.workedAt,
      orderedAt: this.bill.orderedAt,
      billedAt: this.bill.billedAt
    };
    this.form.setValue(billFormValue);
  }

  onSubmit() {
    if (this.form.valid) {
      this.onSubmitted.emit(this.form.value);
      this.onSubmitted.complete();
    } else {
      // tslint:disable-next-line:no-unused-expression
      this.scrollToAndFocus('.mat-input-element.ng-touched.ng-invalid') ||
        this.scrollToAndFocus('.mat-input-element.ng-invalid') ||
        window.scrollTo(0, 0);
    }
  }

  private scrollToAndFocus(query: string): boolean {
    const element = document.querySelector(query) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      setTimeout(() => element.focus(), 500);
    }
    return !!element;
  }

  abort() {
    this.onAborted.emit();
    this.onAborted.complete();
    return false;
  }
}
