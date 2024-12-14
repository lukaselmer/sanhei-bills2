export class AddressView {
  constructor(private readonly address: string) {}

  get billName() {
    return this.firstLinesWithoutLastTwo.join(' ').substring(0, 70)
  }

  get billAddress() {
    return this.secondLastLine.substring(0, 70)
  }

  get billZip() {
    return this.zipAndCity[0]
  }

  get billCity() {
    return this.zipAndCity[1]
  }

  get billCountry() {
    return 'CH'
  }

  private get zipAndCity() {
    const [zip, ...cityParts] = this.lastLine.split(' ')
    return [zip, cityParts.join(' ')]
  }

  get lines() {
    return this.address.split('\n').filter((line) => line)
  }

  get commaSeparated() {
    return this.lines.join(', ')
  }

  get firstLine() {
    return this.lines[0]
  }

  get firstLinesWithoutLastTwo() {
    return this.lines.filter(
      (_, index) => index !== this.lines.length - 2 && index !== this.lines.length - 1,
    )
  }

  get secondLastLine() {
    return this.lines[this.lines.length - 2]
  }

  get lastLine() {
    return this.lines[this.lines.length - 1]
  }

  get middleLines() {
    return this.lines.filter((_, index) => index !== 0 && index !== this.lines.length - 1)
  }
}
