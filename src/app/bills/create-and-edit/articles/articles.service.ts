import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Observable, from } from 'rxjs';
import { Article } from '../../article';
import { Bill } from '../../bill';
import { BillsService } from './../../bills.service';
import { AutocompleteArticle } from './autocomplete-article';
import { filter, take, toArray } from 'rxjs/operators';

@Injectable()
export class ArticlesService {
  private autocompleteArticles: AutocompleteArticle[] | undefined;

  get initilizedAutocompleteArticles(): AutocompleteArticle[] {
    if (!this.autocompleteArticles) throw new Error('this.autocompleteArticles is not initilized');
    return this.autocompleteArticles;
  }

  constructor(private readonly billsService: BillsService) {}

  filterAutocompleteArticles(filterStr: string): AutocompleteArticle[] {
    this.ensureInitializedCache();

    const terms = filterStr.toLocaleLowerCase().split(' ');
    let descriptions: AutocompleteArticle[] = [];
    from(this.initilizedAutocompleteArticles)
      .pipe(
        filter(autocompleteArticle => autocompleteArticle.matchesAll(terms)),
        take(25),
        toArray()
      )
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
      this.initilizedAutocompleteArticles.push(autocompleteArticle);
      uniqMap[autocompleteArticle.stringToFilter] = true;
    }
  }
}
