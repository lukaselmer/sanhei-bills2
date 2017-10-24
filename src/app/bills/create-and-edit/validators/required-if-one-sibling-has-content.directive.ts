import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';

export function requiredIfOneSiblingHasContent(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = (control.value as string || '').trim();
    if (value.length > 0 || !control.parent) return null;

    const controlsMap = control.parent.controls as { [key: string]: AbstractControl };
    const hasError = Object.keys(controlsMap)
      .map(k => controlsMap[k])
      .some((c: FormControl) => c.value);
    return hasError ?
      { requiredIfOneSiblingHasContent: { value } }
      : null;
  };
}
