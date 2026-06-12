function encodeForCsv(value: string): string {
  let encoded = value.replace(/"/g, '""');

  if (encoded.search(/("|,|\n)/g) >= 0) {
    encoded = '"' + encoded + '"';
  }

  return encoded;
}

export function determineLongestColumn(columns: string[][]): number {
  return columns.reduce(
    (longest, column) => (column.length > longest ? column.length : longest),
    columns.length
  );
}

/**
 * Builds CSV text from an array of columns (each an array of cell values),
 * transposing them into rows.
 */
export function buildCsvText(columns: string[][]): string {
  let csvText = '';
  const longestColumn = determineLongestColumn(columns);

  for (let rowIndex = 0; rowIndex < longestColumn; rowIndex++) {
    for (let columnIndex = 0; columnIndex < longestColumn; columnIndex++) {
      const column = columns[columnIndex];

      if (column === undefined) {
        break;
      }

      csvText += encodeForCsv(column[rowIndex] ?? '') + ',';
    }

    csvText += '\r\n';
  }

  return csvText;
}
