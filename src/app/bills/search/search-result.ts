import { DataStoreStatus } from '../store/data-store-status';

export class SearchResult<T>{
  term: string;
  list: T[];
  dbStatus: DataStoreStatus;
}
