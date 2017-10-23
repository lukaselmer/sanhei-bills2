// Remove this as soon as the rule is fixed (current version: 3.2.1),
// see https://github.com/mgechev/codelyzer/releases
/* tslint:disable:no-access-missing-member */

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { ArticlesService } from './../articles.service';
import { Bill } from './../bill';
import { BillFormExtractor } from './bill-form-extractor';
import { FormArticle } from './form-article';

@Component({
  selector: 'sb-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss']
})
export class BillFormComponent implements OnInit, OnChanges {
  @Input() bill: Bill;

  @Output() onSubmitted = new EventEmitter<Bill>();
  @Output() onAborted = new EventEmitter<void>();

  form: FormGroup;
  formArticles: FormArticle[];
  autocompleteOptions: { [index: string]: Observable<string[]> } = {};
  articleDescriptionFocusStream = new Subject<string>();

  constructor(private articlesService: ArticlesService, private fb: FormBuilder) {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      articles: this.fb.array([]),

      cashback: ['', Validators.required],
      vat: ['',
        Validators.compose([
          Validators.required,
          Validators.min(1)]
        )
      ],
      discount: ['', Validators.required],

      address: ['', Validators.required],
      billType: ['', Validators.required],
      description: '',
      workedAt: [''],
      ordererName: [''],
      ownerName: [''],
      title: ['', Validators.required],
      descriptionTitle: ['', Validators.required],

      orderedAt: '',
      billedAt: ''
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.bill && changes.bill.currentValue) this.billChanged(this.bill);
  }

  ngOnInit(): void {
    this.initBillAutocomplete();
  }

  private initBillAutocomplete() {
    ['billType', 'address', 'title', 'descriptionTitle', 'ownerName', 'ordererName', 'description']
      .forEach(field =>
        this.autocompleteOptions[field] = (this.form.get(field) as FormControl)
          .valueChanges
          .map(v => this.articlesService.autocompleteOptions(field, v))
      );
  }

  private billChanged(bill: Bill) {
    this.bill = bill;
    this.articlesChanged();

    const billFormValue = {
      articles: this.formArticles,
      cashback: bill.cashback,
      vat: bill.vat,
      discount: bill.discount,
      address: bill.address,
      billType: bill.billType,
      description: bill.description,
      ordererName: bill.ordererName,
      ownerName: bill.ownerName,
      title: bill.title,
      descriptionTitle: bill.descriptionTitle,
      workedAt: bill.workedAt,
      orderedAt: bill.orderedAt,
      billedAt: bill.billedAt
    };
    this.form.setValue(billFormValue);
  }

  private articlesChanged() {
    this.formArticles = this.bill.articles.map(article => new FormArticle(article));
    this.setArticles(this.formArticles);
    this.addNewArticle(Math.max(1, 5 - this.formArticles.length));
  }

  removeArticleAt(index: number) {
    // This would be nice, but it does not work because of angular material (atm): this.articlesForm.removeAt(index);
    // TODO: autocomplete: if the cursor is in a field with autocomplete, the element cannot be deleted, otherwise
    // this is raised: ERROR TypeError: Cannot read property 'destroyed' of null
    const values: FormArticle[] = this.articlesForm.value;
    const combinedArticles = values.filter((_, i) => i !== index);
    this.setArticles(combinedArticles);
  }

  private setArticles(formArticles: FormArticle[]) {
    const articleFormGroups = formArticles.map(a => this.fb.group({
      amount: [a.amount, Validators.required],
      price: [a.price, Validators.required],
      catalogId: a.catalogId,
      description: [a.description, Validators.required],
      dimension: [a.dimension]
    }));
    this.form.setControl('articles', this.fb.array(articleFormGroups));

    this.initArticlesAutocomplete();
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

  addNewArticle(amount: number) {
    for (let i = 0; i < amount; ++i) this.formArticles.push(new FormArticle());
    this.setArticles(this.formArticles);
  }

  get articlesForm(): FormArray {
    return this.form.get('articles') as FormArray;
  }

  onSubmit() {
    this.removeEmptyArticles();
    if (this.form.valid) {
      const extractor = new BillFormExtractor(this.bill, this.form.value);
      this.onSubmitted.emit(extractor.extractBill());
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
