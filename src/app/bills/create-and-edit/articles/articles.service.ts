import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Article } from '../../article';
import { Bill } from '../../bill';
import { DataStoreService } from '../../store/data-store.service';

@Injectable()
export class ArticlesService {
  articleDescriptionsCache: string[];

  constructor(private dataStore: DataStoreService) { }

  uniqueDescriptions(filter: string): string[] {
    const lowerCaseFilter = filter.toLocaleLowerCase();
    return this.articleDescriptions()
      .filter(description => description.toLocaleLowerCase().includes(lowerCaseFilter))
      .slice(0, 20);
  }

  private articleDescriptions(): string[] {
    if (!this.articleDescriptionsCache) {
      const bills = this.dataStore.store().bills;
      const uniqDescriptionsMap: { [index: string]: boolean } = {};
      const uniqDescriptionsList: string[] = [];
      Object.keys(bills).reverse().forEach(k =>
        bills[k].articles.forEach(article => {
          if (!uniqDescriptionsMap[article.description]) uniqDescriptionsList.push(article.description);
          uniqDescriptionsMap[article.description] = true;
        }));
      this.articleDescriptionsCache = uniqDescriptionsList;
    }
    return this.articleDescriptionsCache;
  }
}