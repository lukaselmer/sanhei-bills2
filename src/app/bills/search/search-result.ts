export class SearchResult<T>{
  term: string;
  list: T[];
  dbStatus: 'loading' | 'partiallyLoaded' | 'loaded';
}
