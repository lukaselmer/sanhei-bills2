import { DataStoreStatus } from '../store/data-store-status';

export interface SearchResult<T> {
  term: string;
  list: T[];
  dbStatus: DataStoreStatus;
}
