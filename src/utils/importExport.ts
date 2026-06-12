import { jsPDF } from 'jspdf';
import type { Board, SortField } from '../types';
import { buildCsvText } from './csv';
import { sortMessages } from './messages';

/** Plain-text rendering of the whole board, used for "copy to clipboard". */
export function getBoardPureText(board: Board, sortField: SortField): string {
  let clipboard = '';
  const sorted = sortMessages(board.messages, sortField);

  board.columns.forEach((column, index) => {
    clipboard += (index === 0 ? '' : '\n') + column.value + '\n';

    sorted.forEach((message) => {
      if (message.type.id === column.id) {
        clipboard += '- ' + message.text + ' (' + message.votes + ' votes) \n';
      }
    });
  });

  return clipboard;
}

export async function copyBoardToClipboard(
  board: Board,
  sortField: SortField
): Promise<void> {
  await navigator.clipboard.writeText(getBoardPureText(board, sortField));
}

function downloadFile(content: BlobPart, type: string, fileName: string): void {
  const blob = new Blob([content], { type });
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = fileName;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(downloadLink.href);
}

export function generateCsv(board: Board, sortField: SortField): void {
  const sorted = sortMessages(board.messages, sortField);

  const columns = board.columns.map((column) => [
    column.value,
    ...sorted
      .filter((message) => message.type.id === column.id)
      .map((message) => message.text),
  ]);

  downloadFile(buildCsvText(columns), 'text/csv', board.name + '.csv');
}

export function generatePdf(board: Board, sortField: SortField): void {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentHeight = 10;
  const sorted = sortMessages(board.messages, sortField);

  board.columns.forEach((column) => {
    if (currentHeight > pageHeight - 10) {
      pdf.addPage();
      currentHeight = 10;
    }

    pdf.setFont('helvetica', 'bold');
    currentHeight += 5;
    pdf.text(column.value, 10, currentHeight);
    currentHeight += 10;
    pdf.setFont('helvetica', 'normal');

    sorted.forEach((message) => {
      if (message.type.id !== column.id) {
        return;
      }

      const parsedText = pdf.splitTextToSize(
        '- ' + message.text + ' (' + message.votes + ' votes)',
        180
      );
      pdf.text(parsedText, 10, currentHeight);
      currentHeight += pdf.getTextDimensions(parsedText).h;

      if (currentHeight > pageHeight - 10) {
        pdf.addPage();
        currentHeight = 10;
      }
    });
  });

  pdf.save(board.name + '.pdf');
}
