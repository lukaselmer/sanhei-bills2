export function isGap(description: string) {
  const desc = description.toLowerCase()
  return desc === 'gap' || desc === 'abstand' || desc === 'leer'
}
