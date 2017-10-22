import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { Article } from './../article';
import { ArticlesService } from './../articles.service';
import { Bill } from './../bill';
import { BillsService } from './../bills.service';
import { BillFormExtractor } from './bill-form-extractor';
import { FormArticle } from './form-article';

// Remove this as soon as the rule is fixed (current version: 3.2.1),
// see https://github.com/mgechev/codelyzer/releases
/* tslint:disable:no-access-missing-member */

@Component({
  selector: 'sb-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit {
  id: string;
  form: FormGroup;
  bill: Bill;
  formArticles: FormArticle[];
  submitted = false;
  autocompleteOptions: { [index: string]: Observable<string[]> } = {};
  articleDescriptionFocusStream = new Subject<string>();

  constructor(
    private router: Router, route: ActivatedRoute, private billsService: BillsService,
    private articlesService: ArticlesService, private fb: FormBuilder) {
    this.id = route.snapshot.params['id'];
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      articles: this.fb.array([]),

      cashback: '',
      vat: ['',
        Validators.compose([
          Validators.required,
          Validators.min(1)]
        )
      ],
      discount: '',

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

  ngOnInit(): void {
    this.initBillAutocomplete();
    this.billsService.editBill(this.id).forEach(bill => this.billChanged(bill));
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
    if (this.submitted) return;
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
      this.submitted = true;
      const extractor = new BillFormExtractor(this.bill, this.form.value);
      this.billsService.updateBill(extractor.extractBill());
      this.abort();
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
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
    return false;
  }
}
