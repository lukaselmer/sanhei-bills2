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
  originalArticles: FormArticle[];
  myArticlesForm: FormArray;
  potentialDanglingArticles: Article[] = [];
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
    this.originalArticles = this.bill.articles.map(article => new FormArticle(article));
    const billFormValue = {
      articles: [],
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
    this.articlesChanged();
  }

  private articlesChanged() {
    this.setArticles(this.originalArticles);
    this.addNewArticle(Math.max(1, 5 - this.originalArticles.length));
  }

  removeArticleAt(index: number) {
    const values: FormArticle[] = this.articlesForm.value;
    const combinedArticles = values.filter((_, i) => i !== index);
    this.setArticles(combinedArticles);
  }

  private setArticles(articles: FormArticle[]) {
    const articleFormGroups = articles.map(ba => this.fb.group(ba));
    this.myArticlesForm = this.fb.array(articleFormGroups);
    this.form.setControl('articles', this.myArticlesForm);
  }

  addNewArticle(amount: number) {
    for (let i = 0; i < amount; ++i) {
      this.articlesForm.push(this.fb.group(new FormArticle()));
    }
  }

  get articlesForm(): FormArray {
    return this.form.get('articles') as FormArray;
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted = true;
      const extractor = new BillFormExtractor(this.bill, this.form.value);
      this.billsService.updateBill(extractor.extractBill());
      this.abort();
    } else {
      window.scrollTo(0, 0);
    }
  }

  abort() {
    this.router.navigate(['bills']);
    window.scrollTo(0, 0);
    return false;
  }
}
