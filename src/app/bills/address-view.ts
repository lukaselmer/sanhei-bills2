export class AddressView {
  constructor(private readonly address: string) {}

  get lines() {
    return this.address.split('\n').filter(line => line);
  }

  get commaSeparated() {
    return this.lines.join(', ');
  }

  get firstLine() {
    return this.lines[0];
  }

  get lastLine() {
    return this.lines[this.lines.length - 1];
  }

  get middleLines() {
    return this.lines.filter((_, index) => index !== 0 && index !== this.lines.length - 1);
  }
}
