import { AbstractControl, ValidatorFn } from '@angular/forms'
import { validDateNumbers } from '../../../shared/date-helper'

export function workedAtValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value
    if (!value || value === '') return null

    const dateRegexp = /([0-9]{2,4}-[0-9]{1,2}-[0-9]{1,2})/g
    const dateStrings = (value.match(dateRegexp) || []) as string[]
    if (dateStrings.every(validDateNumbers)) return null

    return { workedAtValidator: { value } }
  }
}
