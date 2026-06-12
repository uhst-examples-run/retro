import type { Board, SortField } from '../types';
import {
  copyBoardToClipboard,
  generateCsv,
  generatePdf,
} from '../utils/importExport';

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
  board: Board;
  sortField: SortField;
  onOpenImport: () => void;
  onOpenVoteSettings: () => void;
  onOpenPrivateWriting: () => void;
  onOpenDeleteCards: () => void;
  onOpenDeleteBoard: () => void;
}

export function Sidebar({
  opened,
  onClose,
  board,
  sortField,
  onOpenImport,
  onOpenVoteSettings,
  onOpenPrivateWriting,
  onOpenDeleteCards,
  onOpenDeleteBoard,
}: SidebarProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={
          'sidebar-overlay' + (opened ? ' sidebar-overlay-show' : '')
        }
      ></div>
      <div className={'sidebar' + (opened ? ' sidebar-show' : '')}>
        <div className="sidebar-header">
          <a onClick={onClose} aria-label="Close settings sidebar">
            <i className="fa fa-times"></i>
          </a>
        </div>
        <div className="sidebar-body">
          <button
            className="normal-button"
            onClick={() => copyBoardToClipboard(board, sortField)}
          >
            <i className="fa fa-clipboard"></i>Copy board to clipboard
          </button>
          <button
            className="normal-button"
            onClick={() => generatePdf(board, sortField)}
          >
            <i className="fa fa-download"></i>Export board to PDF
          </button>
          <button
            className="normal-button"
            onClick={() => generateCsv(board, sortField)}
          >
            <i className="fa fa-download"></i>Export board to CSV
          </button>
          <button className="normal-button" onClick={onOpenImport}>
            <i className="fa fa-upload"></i>Import CSV
          </button>
          <button className="normal-button" onClick={onOpenVoteSettings}>
            <i className="fa fa-thumbs-up"></i>Vote settings
          </button>
          <button className="normal-button" onClick={onOpenPrivateWriting}>
            <i className="fa fa-sticky-note"></i>Private writing
          </button>
          <button className="delete-button" onClick={onOpenDeleteCards}>
            <i className="fa fa-trash"></i>Delete cards
          </button>
          <button className="delete-button" onClick={onOpenDeleteBoard}>
            <i className="fa fa-trash"></i>Delete board
          </button>
        </div>
      </div>
    </>
  );
}
