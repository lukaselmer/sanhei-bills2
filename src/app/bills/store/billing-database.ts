import { Article } from './../article';
import { Bill } from './../bill';
import { BillArticle } from './../bill-article';

export interface IBillingDatabase {
  articles: { [index: string]: Article };
  billArticles: { [index: string]: BillArticle };
  bills: { [index: string]: Bill };
}
