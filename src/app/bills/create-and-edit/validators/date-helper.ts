export function validDateNumbers(value: string): boolean {
  // tslint:disable-next-line:prefer-const
  let [y, m, d] = value.split('-').map(x => parseInt(x, 10));
  if (y < 100) y += 2000;

  if (m < 1 || m > 12) return false;
  if (y < 1990 || y > 2090) return false;
  if (d < 1 || d > daysInMonth(m, y)) return false;

  return true;
}

function daysInMonth(m: number, y: number) {
  switch (m) {
    case 2:
      return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28;
    case 4: case 6: case 9: case 11:
      return 30;
    default:
      return 31;
  }
}
