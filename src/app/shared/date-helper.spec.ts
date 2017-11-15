import { dateOrEmpty, stringToDate, validDateNumbers } from './date-helper';

describe('date-helper', () => {
  describe('stringToDate', () => {
    it('converts a string to a date', () => {
      const date = stringToDate('2017-03-25');
      expect(date.toString().startsWith('Sat Mar 25 2017')).toBeTruthy();
    });
  });

  describe('dateOrEmpty', () => {
    it('normalizes the dates', () => {
      expect(dateOrEmpty('2017-01-20')).toEqual('2017-01-20');
      expect(dateOrEmpty('2017-1-20')).toEqual('2017-01-20');
      expect(dateOrEmpty('17-1-20')).toEqual('2017-01-20');
      expect(dateOrEmpty('2017-1-2')).toEqual('2017-01-02');
    });

    it('resets the date if it is invalid', () => {
      expect(dateOrEmpty('17--20')).toEqual('');
      expect(dateOrEmpty('fwefweaf-ewfwefaaewf-faewawef')).toEqual('');
      expect(dateOrEmpty('fwefweafewfwefaaewffaewawef')).toEqual('');
      expect(dateOrEmpty('17-0-20')).toEqual('');
      expect(dateOrEmpty('17-10-111')).toEqual('');
      expect(dateOrEmpty('17-13-1')).toEqual('');
    });
  });

  describe('validDateNumbers', () => {
    it('returns true if the date is valid', () => {
      expect(validDateNumbers('2017-01-20')).toBeTruthy();
      expect(validDateNumbers('2017-01-31')).toBeTruthy();
      expect(validDateNumbers('2017-02-28')).toBeTruthy();
      expect(validDateNumbers('2020-02-29')).toBeTruthy();
      expect(validDateNumbers('2017-03-31')).toBeTruthy();
      expect(validDateNumbers('2017-3-1')).toBeTruthy();
      expect(validDateNumbers('2017-12-31')).toBeTruthy();
      expect(validDateNumbers('2017-1-1')).toBeTruthy();
    });

    it('returns false if the date is invalid', () => {
      expect(validDateNumbers('2017-0-1')).toBeFalsy();
      expect(validDateNumbers('2017-01-00')).toBeFalsy();
      expect(validDateNumbers('2017-01-32')).toBeFalsy();
      expect(validDateNumbers('2017-02-29')).toBeFalsy();
      expect(validDateNumbers('2020-02-30')).toBeFalsy();
      expect(validDateNumbers('2017-13-31')).toBeFalsy();
    });
  });
});
