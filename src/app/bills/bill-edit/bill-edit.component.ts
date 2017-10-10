import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from './../article';
import { Bill } from './../bill';
import { BillsService } from './../bills.service';
import { BillFormExtractor } from './bill-form-extractor';
import { FormArticle } from './form-article';

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

  constructor(private router: Router, route: ActivatedRoute, private billsService: BillsService, private fb: FormBuilder) {
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
      fixedAtDescription: ['', Validators.required],
      ordererName: ['', Validators.required],
      ownerName: ['', Validators.required],
      title1: ['', Validators.required],
      title2: ['', Validators.required],

      orderedAt: '',
      billedAt: ''
    });
  }

  ngOnInit(): void {
    this.billsService.editBill(this.id).forEach(bill => this.billChanged(bill));
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
      title1: bill.title1,
      title2: bill.title2,
      fixedAtDescription: bill.fixedAtOverride.length > 0 ?
        bill.fixedAtOverride :
        bill.fixedAt,
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
    const values: FormArticle[] = this.articlesForm.value;
    const combinedArticles = values.filter((_, i) => i !== index);
    this.setArticles(combinedArticles);
  }

  private setArticles(articles: FormArticle[]) {
    const articleFormGroups = articles.map(a => this.fb.group({
      amount: [a.amount, Validators.required],
      price: [a.price, Validators.required],
      catalogId: a.catalogId,
      description: [a.description, Validators.required],
      dimension: [a.dimension]
    }));
    this.form.setControl('articles', this.fb.array(articleFormGroups));
  }

  addNewArticle(amount: number) {
    for (let i = 0; i < amount; ++i) {
      this.formArticles.push(new FormArticle());
      this.articlesForm.push(this.fb.group({
        amount: ['', Validators.required],
        price: ['', Validators.required],
        catalogId: [''],
        description: ['', Validators.required],
        dimension: ['']
      }));
    }
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
