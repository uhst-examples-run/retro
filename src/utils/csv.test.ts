import { describe, expect, it } from 'vitest';
import { buildCsvText, determineLongestColumn } from './csv';

const square = [
  ['1', '2'],
  ['3', '4'],
];

const fewColumnsManyRows = [
  ['1', '2', '3', '4'],
  ['5', '6'],
];

const fewRowsManyColumns = [['1', '2'], ['3', '4'], ['5'], ['6']];

const specialCharacters = [
  ['"Quotes"', 'Wait, a comma?', 'Newline\nCinema', '"Hey",\nall together'],
];

describe('buildCsvText', () => {
  it('outputs a comma and a new line when empty', () => {
    expect(buildCsvText([[]])).toBe(',\r\n');
  });

  it('outputs valid csv when there are no cards and only one column', () => {
    expect(buildCsvText([['1']])).toBe('1,\r\n');
  });

  it('outputs correct csv for a square grid', () => {
    expect(buildCsvText(square)).toBe('1,3,\r\n2,4,\r\n');
  });

  it('returns square board when grid is few columns and many rows', () => {
    expect(buildCsvText(fewColumnsManyRows)).toBe('1,5,\r\n2,6,\r\n3,,\r\n4,,\r\n');
  });

  it('returns square board when grid is few rows and many columns', () => {
    expect(buildCsvText(fewRowsManyColumns)).toBe(
      '1,3,5,6,\r\n2,4,,,\r\n,,,,\r\n,,,,\r\n'
    );
  });

  it('encodes special characters', () => {
    expect(buildCsvText(specialCharacters)).toBe(
      '"""Quotes""",\r\n"Wait, a comma?",\r\n"Newline\nCinema",\r\n"""Hey"",\nall together",\r\n'
    );
  });
});

describe('determineLongestColumn', () => {
  it('finds the highest length for a square', () => {
    expect(determineLongestColumn(square)).toBe(2);
  });

  it('finds the highest length for few columns and many rows', () => {
    expect(determineLongestColumn(fewColumnsManyRows)).toBe(4);
  });

  it('finds the highest length for few rows and many columns', () => {
    expect(determineLongestColumn(fewRowsManyColumns)).toBe(4);
  });
});
