import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { currentDateAsISO8601WithoutDays } from '../../shared/date-helper';
import { Bill } from './../bill';
import { EditedBill } from './../edited-bill';
import { NewBill } from './../new-bill';
import { BillAutocompleteService } from './bill-autocomplete.service';
import { BillFormExtractor } from './bill-form-extractor';
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
  @Output() submitted = new EventEmitter<any>();
  @Output() aborted = new EventEmitter<void>();

  form: FormGroup;
  autocompleteOptions: {
    [index: string]: Observable<string[]>;
  } = {};

  constructor(private autocompleteService: BillAutocompleteService, private fb: FormBuilder) {}

  private createForm() {
    if (this.form) return;

    this.form = this.fb.group({
      articles: this.fb.array([]),

      ...this.editSpecificFormValues(),

      cashback: [
        Bill.DEFAULTS.cashback + '',
        Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])
      ],
      vat: [
        Bill.DEFAULTS.vat + '',
        Validators.compose([Validators.required, Validators.min(1), Validators.max(100)])
      ],
      discount: [
        Bill.DEFAULTS.discount + '',
        Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])
      ],
      paymentDeadlineInDays: [
        Bill.DEFAULTS.paymentDeadlineInDays + '',
        Validators.compose([Validators.required, Validators.min(1), Validators.max(1000)])
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
      billedAt: ['', dateValidator()]
    });
  }

  private editSpecificFormValues() {
    return this.createNewBill
      ? {}
      : {
          humanId: ['', Validators.required]
        };
  }

  private dateDefault(): string {
    return currentDateAsISO8601WithoutDays();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const validBillEditValue = changes.bill && changes.bill.currentValue;
    if (!this.createNewBill && !validBillEditValue) {
      return;
    }

    this.createForm();
    this.initBillAutocomplete();
    this.billChanged();
  }

  private initBillAutocomplete() {
    if (this.autocompleteOptions['title']) {
      return;
    }

    [
      'billType' as 'billType',
      'address' as 'address',
      'title' as 'title',
      'descriptionTitle' as 'descriptionTitle',
      'ownerName' as 'ownerName',
      'ordererName' as 'ordererName',
      'description' as 'description'
    ].forEach(
      field =>
        (this.autocompleteOptions[field] = (this.form.get(field) as FormControl).valueChanges
          .startWith('')
          .map(v => this.autocompleteService.autocompleteOptions(field, v)))
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
      this.submitted.emit(this.form.value);
      this.submitted.complete();
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
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      setTimeout(() => element.focus(), 500);
    }
    return !!element;
  }

  abort() {
    this.aborted.emit();
    this.aborted.complete();
    return false;
  }

  descriptionTitleSelected(event: MatAutocompleteSelectedEvent) {
    const descriptionControl = this.form.controls.description;
    if (descriptionControl.value) {
      return;
    }

    const description = this.autocompleteService.descriptionForDescriptionTitle(event.option.value);
    descriptionControl.setValue(description);
  }

  addressSelected(event: MatAutocompleteSelectedEvent) {
    const discountControl = this.form.controls.discount;
    const paymentDeadlineControl = this.form.controls.paymentDeadlineInDays;

    const bill = this.autocompleteService.billForAddress(event.option.value);
    if (!bill) return;

    discountControl.setValue(bill.discount + '');
    paymentDeadlineControl.setValue(
      (bill.paymentDeadlineInDays || Bill.DEFAULTS.paymentDeadlineInDays) + ''
    );
  }

  titleSelected(event: MatAutocompleteSelectedEvent) {
    const addressControl = this.form.controls.address;
    const ownerNameControl = this.form.controls.ownerName;
    const discountControl = this.form.controls.discount;
    const paymentDeadlineControl = this.form.controls.paymentDeadlineInDays;

    const bill = this.autocompleteService.billForTitle(event.option.value);
    if (!bill) return;

    if (!addressControl.value) {
      addressControl.setValue(bill.address);
    }
    if (!ownerNameControl.value) {
      ownerNameControl.setValue(bill.ownerName);
    }
    if (discountControl.value === Bill.DEFAULTS.discount + '') {
      discountControl.setValue(bill.discount + '');
    }
    if (paymentDeadlineControl.value === Bill.DEFAULTS.paymentDeadlineInDays + '') {
      paymentDeadlineControl.setValue(
        (bill.paymentDeadlineInDays || Bill.DEFAULTS.paymentDeadlineInDays) + ''
      );
    }
  }
}
