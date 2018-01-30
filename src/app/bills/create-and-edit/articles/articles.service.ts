import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Article } from '../../article';
import { Bill } from '../../bill';
import { BillsService } from './../../bills.service';
import { AutocompleteArticle } from './autocomplete-article';

@Injectable()
export class ArticlesService {
  private autocompleteArticles: AutocompleteArticle[];

  constructor(private readonly billsService: BillsService) {}

  filterAutocompleteArticles(filter: string): AutocompleteArticle[] {
    this.ensureInitializedCache();

    const terms = filter.toLocaleLowerCase().split(' ');
    let descriptions: AutocompleteArticle[] = [];
    Observable.from(this.autocompleteArticles)
      .filter(autocompleteArticle => autocompleteArticle.matchesAll(terms))
      .take(25)
      .toArray()
      .subscribe(descriptionsHack => (descriptions = descriptionsHack));
    return descriptions;
  }

  private ensureInitializedCache() {
    if (!this.autocompleteArticles) {
      this.initArticleDescriptions();
    }
  }

  private initArticleDescriptions() {
    this.autocompleteArticles = [];

    const uniqMap = {};
    this.billsService
      .getBills()
      .map(bill => bill.articles)
      .forEach(articles => articles.forEach(article => this.handleArticle(article, uniqMap)));
  }

  private handleArticle(
    article: Article,
    uniqMap: {
      [index: string]: boolean;
    }
  ) {
    const autocompleteArticle = new AutocompleteArticle(article);
    const articleAlreadyInList = uniqMap[autocompleteArticle.stringToFilter];
    if (!articleAlreadyInList) {
      this.autocompleteArticles.push(autocompleteArticle);
      uniqMap[autocompleteArticle.stringToFilter] = true;
    }
  }
}
