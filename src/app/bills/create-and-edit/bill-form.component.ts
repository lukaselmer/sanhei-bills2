// Remove this as soon as the rule is fixed (current version: 3.2.1),
// see https://github.com/mgechev/codelyzer/releases
/* tslint:disable:no-access-missing-member */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { ArticlesService } from './../articles.service';
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
  formArticles: FormArticle[] = [];
  autocompleteOptions: { [index: string]: Observable<string[]> } = {};
  articleDescriptionFocusStream = new Subject<string>();

  constructor(private articlesService: ArticlesService, private fb: FormBuilder) { }

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
    const d = new Date();
    const month = `${d.getMonth() + 1}`;
    return `${d.getFullYear()}-${month.length === 1 ? '0' + month : month}-`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const validBillEditValue = changes.bill && changes.bill.currentValue;
    if (!this.createNewBill && !validBillEditValue) return;

    this.createForm();
    this.initBillAutocomplete();
    this.createNewBill ? this.initNewBill() : this.billChanged();
  }

  private initBillAutocomplete() {
    if (this.autocompleteOptions['title']) return;

    ['billType', 'address', 'title', 'descriptionTitle', 'ownerName', 'ordererName', 'description']
      .forEach(field =>
        this.autocompleteOptions[field] = (this.form.get(field) as FormControl)
          .valueChanges
          .startWith('')
          .map(v => this.articlesService.autocompleteOptions(field, v))
      );
  }

  private initNewBill() {
    this.addNewArticles(5);
  }

  private billChanged() {
    this.articlesChanged();

    const billFormValue = {
      articles: this.formArticles,
      humanId: this.bill.humanId,
      cashback: this.bill.cashback,
      vat: this.bill.vat,
      discount: this.bill.discount,
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

  private articlesChanged() {
    this.formArticles = this.bill.articles.map(article => new FormArticle(article));
    this.setArticles(this.formArticles);
    this.addNewArticles(Math.max(1, 5 - this.formArticles.length));
  }

  removeArticleAt(index: number) {
    const values: FormArticle[] = this.articlesForm.value;
    const combinedArticles = values.filter((_, i) => i !== index);
    this.setArticles(combinedArticles);
  }

  private setArticles(formArticles: FormArticle[]) {
    const articleFormGroups = formArticles.map(a => this.fb.group({
      amount: [a.amount, Validators.compose([
        requiredIfOneSiblingHasContent(),
        numberValidator()
      ])],
      price: [a.price, Validators.compose([
        requiredIfOneSiblingHasContent(),
        numberValidator()
      ])],
      catalogId: a.catalogId,
      description: [a.description, requiredIfOneSiblingHasContent()],
      dimension: a.dimension
    }));
    this.keepAricleValidationsUpdated(articleFormGroups);
    this.form.setControl('articles', this.fb.array(articleFormGroups));
    this.initArticlesAutocomplete();
  }

  private keepAricleValidationsUpdated(articleFormGroups: FormGroup[]) {
    // automaticValueChangeInProgress avoids recursive value changes
    let automaticValueChangeInProgress = false;
    articleFormGroups.forEach(fg => {
      fg.valueChanges.map(() => {
        if (automaticValueChangeInProgress) return;
        automaticValueChangeInProgress = true;
        Object.keys(fg.controls).forEach(fieldKey =>
          fg.controls[fieldKey].setValue(fg.controls[fieldKey].value)
        );
        automaticValueChangeInProgress = false;
      }).subscribe();
    });
  }

  private initArticlesAutocomplete() {
    this.autocompleteOptions['articleDescription'] = Observable.from(
      [this.articleDescriptionFocusStream,
      ...this.articlesForm.controls.map(articleForm =>
        articleForm.valueChanges.map(article => article.description)
      )]
    ).mergeAll()
      .map(x => this.articlesService.uniqueDescriptions(x));
  }

  articleFocus(value: string) {
    this.articleDescriptionFocusStream.next(value);
  }

  addNewArticles(amount: number) {
    for (let i = 0; i < amount; ++i) this.formArticles.push(new FormArticle());
    this.setArticles(this.formArticles);
  }

  get articlesForm(): FormArray {
    return this.form.get('articles') as FormArray;
  }

  onSubmit() {
    // this.removeEmptyArticles();
    if (this.form.valid) {
      this.onSubmitted.emit(this.form.value);
      this.onSubmitted.complete();
    } else {
      // tslint:disable-next-line:no-unused-expression
      this.scrollTo('.mat-input-element.ng-touched.ng-invalid') ||
        this.scrollTo('.mat-input-element.ng-invalid') ||
        window.scrollTo(0, 0);
    }
  }

  private scrollTo(query: string): boolean {
    const element = document.querySelector(query) as HTMLElement;
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    return !!element;
  }

  private removeEmptyArticles() {
    const values: FormArticle[] = this.articlesForm.value;
    const combinedArticles = values.filter(val =>
      val.amount !== '' || val.catalogId !== '' ||
      val.description !== '' || val.dimension !== '' || val.price !== ''
    );
    this.setArticles(combinedArticles);
  }

  abort() {
    this.onAborted.emit();
    this.onAborted.complete();
    return false;
  }
}
