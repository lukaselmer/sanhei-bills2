import { Article } from '../../article';

export class AutocompleteArticle {
  readonly stringToFilter: string;

  constructor(private article: Article) {
    // This is initialized in the constructor for performance reasons. Otherwise,
    // the article autocomplete would be too laggy. This string is used to filter
    // articles, and to ensure only unique articles can be found.
    this.stringToFilter = this.calculateStringToFilter();
  }

  get catalogId() { return this.article.catalogId; }
  get description() { return this.article.description; }
  get dimension() { return this.article.dimension; }
  get price() { return this.article.price + ''; }
  get amount() { return this.article.amount + ''; }

  private calculateStringToFilter() {
    return `${this.catalogId} / ${this.description} / ${this.dimension}`.toLocaleLowerCase();
  }

  get displayValue() {
    return [
      this.catalogId,
      this.description,
      this.dimension
    ].filter(field => field).join(' / ');
  }

  matchesAll(filters: string[]): boolean {
    return filters.every(filter =>
      this.stringToFilter.includes(filter)
    );
  }
}
