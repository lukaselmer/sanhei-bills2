import { Injectable } from '@angular/core'
import { Bill } from './../bill'
import { BillsService } from './../bills.service'

@Injectable()
export class BillAutocompleteService {
  constructor(private readonly billsService: BillsService) {}

  autocompleteOptions<BillField extends keyof Bill>(field: BillField, filter: string): string[] {
    const lowerCaseFilter = filter.toLocaleLowerCase()
    return Object.keys(this.valuesMapFor(field))
      .filter((fieldValue) => fieldValue.toLocaleLowerCase().includes(lowerCaseFilter))
      .slice(0, 20)
  }

  private valuesMapFor<BillField extends keyof Bill>(
    field: BillField
  ): {
    [index: string]: Bill | undefined
  } {
    const bills = this.billsService.getBills()
    const fieldValuesMap: {
      [index: string]: Bill | undefined
    } = {}
    bills.forEach((bill) => {
      const fieldValue = bill[field] as string
      if (!fieldValuesMap[fieldValue]) fieldValuesMap[fieldValue] = bill
    })
    return fieldValuesMap
  }

  descriptionForDescriptionTitle(descriptionTitle: string): string {
    const bill = this.valuesMapFor('descriptionTitle')[descriptionTitle]
    return bill ? bill.description : ''
  }

  billForAddress(address: string): Bill | undefined {
    return this.valuesMapFor('address')[address]
  }

  billForTitle(title: string): Bill | undefined {
    return this.valuesMapFor('title')[title]
  }
}
