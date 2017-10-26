// Remove this as soon as the rule is fixed (current version: 3.2.1),
// see https://github.com/mgechev/codelyzer/releases
/* tslint:disable:no-access-missing-member */

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { numberValidator } from '../validators/number-validator.directive';
import { requiredIfOneSiblingHasContent } from '../validators/required-if-one-sibling-has-content.directive';
import { Article } from './../../article';
import { Bill } from './../../bill';
import { EditedBill } from './../../edited-bill';
import { NewBill } from './../../new-bill';
import { ArticlesService } from './articles.service';
import { FormArticle } from './form-article';

@Component({
  selector: 'sb-articles-form',
  templateUrl: './articles-form.component.html',
  styleUrls: ['./articles-form.component.scss']
})
export class ArticlesFormComponent implements OnChanges {
  @Input() formGroup: FormGroup;
  @Input() articles?: Article[];

  formArticles: FormArticle[] = [];
  autocompleteOptions: Observable<string[]>;
  articleDescriptionFocusStream = new Subject<string>();

  constructor(private articlesService: ArticlesService, private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.articles) this.articlesChanged();
  }

  private articlesChanged() {
    this.formArticles = (this.articles || []).map(article => new FormArticle(article));
    this.setArticles();
    this.addNewArticles(Math.max(1, 5 - this.formArticles.length));
  }

  addNewArticles(amount: number) {
    for (let i = 0; i < amount; ++i) this.formArticles.push(new FormArticle());
    this.setArticles();
  }

  removeArticleAt(index: number) {
    // The setTimeout workaround exists to blur the article description field, which
    // closes the material autocomplete menu. Otherwise, en error would be raised when
    // removing the open autocomplete element while it is still open.
    setTimeout(() => {
      const values: FormArticle[] = this.articlesForm.value;
      this.formArticles = values.filter((_, i) => i !== index);
      this.setArticles();
    }, 0);
  }

  private setArticles() {
    const articleFormGroups = this.formArticles.map(a => this.fb.group({
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
    this.formGroup.setControl('articles', this.fb.array(articleFormGroups));
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
    this.autocompleteOptions = Observable.from(
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

  get articlesForm(): FormArray {
    return this.formGroup.get('articles') as FormArray;
  }
}
