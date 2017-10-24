import { AbstractControl, ValidatorFn } from '@angular/forms';
import { validDateNumbers } from './date-helper';

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value || value === '') return null;

    const dateRegexp = /^[0-9]{2,4}-[0-9]{1,2}-[0-9]{1,2}$/;
    if (value.match(dateRegexp) && validDateNumbers(value)) return null;

    return { dateValidator: { value } };
  };
}
