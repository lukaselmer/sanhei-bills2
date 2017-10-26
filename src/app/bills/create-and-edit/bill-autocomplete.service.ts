import { Injectable } from '@angular/core';
import { DataStoreService } from './../store/data-store.service';

@Injectable()
export class BillAutocompleteService {
  constructor(private dataStore: DataStoreService) { }

  autocompleteOptions(field: string, filter: string): string[] {
    const bills = this.dataStore.store().bills;
    const uniqFieldValues: { [index: string]: boolean } = {};
    Object.keys(bills).forEach(k =>
      uniqFieldValues[(bills[k] as any)[field]] = true);

    const lowerCaseFilter = filter.toLocaleLowerCase();
    return Object.keys(uniqFieldValues)
      .filter(fieldValue => fieldValue.toLocaleLowerCase().includes(lowerCaseFilter))
      .slice(0, 20);
  }
}
