import { AbstractControl, ValidatorFn } from '@angular/forms'

export function requiredIfOneSiblingHasContent(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string | Record<string, any> = control.value
    const parent = control.parent

    if (!parent || typeof value === 'object' || value.trim()) return null

    const controlsMap = parent.controls as { [key: string]: AbstractControl }
    const hasError = Object.keys(controlsMap)
      .map((k) => controlsMap[k])
      .some((c: AbstractControl) => c.value)
    return hasError ? { requiredIfOneSiblingHasContent: { value } } : null
  }
}
