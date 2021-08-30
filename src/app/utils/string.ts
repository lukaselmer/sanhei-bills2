import { remove } from 'diacritics'

export function exactLen(length: number, original: string) {
  return maxLen(length, original).padStart(length, '0')
}

export function maxLen(length: number, original: string) {
  return original.slice(0, length)
}

export function toFilename(text: string) {
  return remove(text.toLocaleLowerCase()).replace(/[^a-z0-9-_]/gi, '_')
}
