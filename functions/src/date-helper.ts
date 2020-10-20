export function validDateNumbers(value: string): boolean {
  const [y, m, d] = value.split('-').map((x) => parseInt(x, 10))

  const validYear = y >= 1990 && y <= 2099
  const validMonth = m >= 1 && m <= 12
  const validDay = d >= 1 && d <= daysInMonth(m, y)

  return validYear && validMonth && validDay
}

function daysInMonth(m: number, y: number) {
  switch (m) {
    case 2:
      return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28
    case 4:
    case 6:
    case 9:
    case 11:
      return 30
    default:
      return 31
  }
}

export function currentDateAsISO8601() {
  return `${currentYear()}-${currentPaddedMonth()}-${currentPaddedDay()}`
}

export function currentDateAsISO8601WithoutDays() {
  return `${currentYear()}-${currentPaddedMonth()}-`
}

export function dateForUID(timestamp?: number): string {
  const createdAt = timestamp ? new Date(timestamp) : new Date()
  return `${createdAt.getUTCFullYear() % 2000}${padWithZero(createdAt.getUTCMonth() + 1)}`
}

function currentYear(): string {
  return `${new Date().getUTCFullYear()}`
}

function currentPaddedMonth(): string {
  return padWithZero(new Date().getUTCMonth() + 1)
}

function currentPaddedDay(): string {
  return padWithZero(new Date().getUTCDate())
}

function padWithZero(num: number): string {
  if (num < 10) return '0' + num
  return '' + num
}

export function dateOrEmpty(potentialDate: string): string {
  const dateRegexp = /^[0-9]{2,4}-[0-9]{1,2}-[0-9]{1,2}$/
  if (!potentialDate.match(dateRegexp)) return ''

  const correctlyFormattedDate = cleanDate(potentialDate)
  return validDateNumbers(correctlyFormattedDate) ? correctlyFormattedDate : ''
}

function cleanDate(dateStr: string): string {
  let [y, m, d] = dateStr.split('-')
  if (y.length === 2) y = `20${y}`
  if (m.length === 1) m = `0${m}`
  if (d.length === 1) d = `0${d}`
  return `${y}-${m}-${d}`
}

export function stringToDate(str: string): Date {
  const [y, m, d] = str.split('-').map((s) => parseInt(s, 10))
  return new Date(y, m - 1, d)
}
