import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { from, type Observable, Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, filter, map, mergeAll, share } from 'rxjs/operators'
import { numberValidator } from '../validators/number-validator.directive'
import { requiredIfOneSiblingHasContent } from '../validators/required-if-one-sibling-has-content.directive'
import { Article } from './../../article'
import { ArticlesService } from './articles.service'
import { AutocompleteArticle } from './autocomplete-article'
import { FormArticle } from './form-article'

@Component({
  selector: 'sb-articles-form',
  templateUrl: './articles-form.component.html',
  styleUrls: ['./articles-form.component.scss'],
  standalone: false,
})
export class ArticlesFormComponent implements OnChanges {
  @Input() formGroup: FormGroup | undefined
  @Input() articles?: Article[]

  formArticles: FormArticle[] = []
  autocompleteOptions: Observable<AutocompleteArticle[]> | undefined
  articleDescriptionFocusStream = new Subject<string>()

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly fb: FormBuilder,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.articles) this.articlesChanged()
  }

  private articlesChanged() {
    this.formArticles = (this.articles || []).map((article) => new FormArticle(article))
    this.setArticlesWithoutTimeout()
    this.addNewArticles(Math.max(1, 5 - this.formArticles.length))
  }

  addNewArticles(amount: number) {
    this.formArticles = this.articlesForm.value
    for (let i = 0; i < amount; ++i) this.formArticles.push(new FormArticle())
    this.setArticles()
  }

  moveUp(index: number) {
    const arr = this.articlesForm.value
    ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
    this.formArticles = arr
    this.setArticles()
  }

  removeAt(index: number) {
    const values: FormArticle[] = this.articlesForm.value
    this.formArticles = values.filter((_, i) => i !== index)
    this.setArticles()
  }

  private setArticles() {
    // The setTimeout workaround exists to blur the article description field, which
    // closes the material autocomplete menu. Otherwise, en error would be raised when
    // removing / changing the autocomplete element while it is still open.
    setTimeout(() => this.setArticlesWithoutTimeout(), 0)
  }
  private setArticlesWithoutTimeout() {
    const articleFormGroups = this.formArticles.map((a) =>
      this.fb.group({
        amount: [a.amount, Validators.compose([requiredIfOneSiblingHasContent(), numberValidator()])],
        price: [a.price, Validators.compose([requiredIfOneSiblingHasContent(), numberValidator()])],
        catalogId: a.catalogId,
        description: [a.description, requiredIfOneSiblingHasContent()],
        dimension: a.dimension,
      }),
    )
    this.keepAricleValidationsUpdated(articleFormGroups)
    if (this.formGroup) this.formGroup.setControl('articles', this.fb.array(articleFormGroups))
    this.initArticlesAutocomplete()
  }

  private keepAricleValidationsUpdated(articleFormGroups: FormGroup[]) {
    // automaticValueChangeInProgress avoids recursive value changes
    let automaticValueChangeInProgress = false
    articleFormGroups.forEach((fg) => {
      fg.valueChanges
        .pipe(
          map(() => {
            if (automaticValueChangeInProgress) return
            automaticValueChangeInProgress = true
            Object.keys(fg.controls).forEach((fieldKey) => {
              fg.controls[fieldKey].markAsTouched()
              fg.controls[fieldKey].setValue(fg.controls[fieldKey].value)
            })
            automaticValueChangeInProgress = false
          }),
        )
        .subscribe()
    })
  }

  private initArticlesAutocomplete() {
    this.autocompleteOptions = from([
      this.articleDescriptionFocusStream,
      ...this.articlesForm.controls.map((articleForm) =>
        articleForm.valueChanges.pipe(map((article) => article.description)),
      ),
    ]).pipe(
      mergeAll(),
      filter<string>((x) => typeof x === 'string'),
      distinctUntilChanged(),
      debounceTime(10),
      distinctUntilChanged(),
      map((currentFilter) => this.articlesService.filterAutocompleteArticles(currentFilter)),
      share(),
    )
  }

  articleFocus(value: string) {
    this.articleDescriptionFocusStream.next(value)
  }

  get articlesForm(): FormArray {
    if (!this.formGroup) throw new Error('this.formGroup is not defined')
    return this.formGroup.get('articles') as FormArray
  }

  autocompleteSelected(index: number, option: AutocompleteArticle) {
    const controls = (this.articlesForm.controls[index] as FormGroup).controls
    controls.catalogId.setValue(option.catalogId)
    controls.description.setValue(option.description)
    controls.dimension.setValue(option.dimension)
    controls.price.setValue(option.price)
    controls.amount.setValue(option.amount)
  }

  displayDescription(option: AutocompleteArticle | string) {
    return typeof option === 'string' ? option : option.description
  }
}
