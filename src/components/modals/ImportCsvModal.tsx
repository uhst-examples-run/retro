import { useState } from 'react';
import Papa from 'papaparse';
import type { Board } from '../../types';
import { Modal } from './Modal';

interface ColumnMapping {
  mapFrom: number;
  mapTo: number;
  name: string;
}

interface ImportCsvModalProps {
  board: Board;
  onImport: (messages: { text: string; columnId: number }[]) => void;
  onClose: () => void;
}

export function ImportCsvModal({
  board,
  onImport,
  onClose,
}: ImportCsvModalProps) {
  const [data, setData] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [error, setError] = useState('');

  const handleFile = (file: File | undefined) => {
    setData([]);
    setMapping([]);
    setError('');

    if (!file) {
      return;
    }

    if (file.size === 0) {
      setError('The file you are trying to import seems to be empty');
      return;
    }

    Papa.parse<string[]>(file, {
      complete: (results) => {
        if (results.data.length > 0) {
          setData(results.data);
          setMapping(
            board.columns.map((column) => ({
              mapFrom: -1,
              mapTo: column.id,
              name: column.value,
            }))
          );

          if (results.errors.length > 0) {
            setError(results.errors[0].message);
          }
        }
      },
    });
  };

  const importMessages = () => {
    const messages: { text: string; columnId: number }[] = [];

    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      for (const columnMapping of mapping) {
        if (columnMapping.mapFrom === -1) {
          continue;
        }

        const text = data[rowIndex][columnMapping.mapFrom];

        if (text) {
          messages.push({ text, columnId: columnMapping.mapTo });
        }
      }
    }

    onImport(messages);
  };

  const nothingMapped = mapping.every((entry) => entry.mapFrom === -1);

  return (
    <Modal onClose={onClose}>
      <h1>Import CSV</h1>
      <span>
        <p>
          1.{' '}
          <label className="inline-link file-upload-link">
            Upload
            <input
              type="file"
              accept="text/csv,.csv"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>{' '}
          a CSV file
        </p>
        <p>File example:</p>
        <pre>
          <code>
            {'Went well, To improve, Action items\n' +
              'text 1, text 3, text 5\n' +
              'text 2, text 4, text 6'}
          </code>
        </pre>
        {mapping.length > 0 && (
          <p>2. Assign each column to a specific CSV column</p>
        )}
        <table>
          <tbody>
            {mapping.map((column, index) => (
              <tr key={column.mapTo}>
                <td className="align-right">
                  <label htmlFor={'column' + index}>{column.name}</label>
                </td>
                <td className="align-left">
                  <select
                    id={'column' + index}
                    className="import-select"
                    value={column.mapFrom}
                    onChange={(event) =>
                      setMapping((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index
                            ? { ...entry, mapFrom: Number(event.target.value) }
                            : entry
                        )
                      )
                    }
                  >
                    <option value={-1}>Select csv column</option>
                    {(data[0] ?? []).map((importColumn, columnIndex) => (
                      <option key={columnIndex} value={columnIndex}>
                        {importColumn}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="error-msg"> {error} </p>}
        <button onClick={importMessages} disabled={nothingMapped}>
          Import
        </button>
        <a onClick={onClose}>Cancel</a>
      </span>
    </Modal>
  );
}
