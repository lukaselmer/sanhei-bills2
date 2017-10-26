import { AbstractControl, ValidatorFn } from '@angular/forms';

export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value || value === '') {
      return null;
    }

    return isNaN(parseInt(value, 10)) ? { numberValidator: { value } } : null;
  };
}
