import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Article } from './article';
import { Bill } from './bill';
import { DataStoreService } from './store/data-store.service';

@Injectable()
export class ArticlesService {
  constructor(private dataStore: DataStoreService) {
    // this.dataStore.loadData();
  }
}
