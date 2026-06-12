import { useState } from 'react';
import type { Board, SortField } from '../types';
import { MAX_COLUMNS } from '../types';
import { remainingVotes } from '../utils/votes';

interface MenuProps {
  board: Board;
  boardId: string;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  filterText: string;
  onFilterTextChange: (text: string) => void;
  onRenameBoard: (name: string) => void;
  onOpenVoteSettings: () => void;
  onOpenNewColumn: () => void;
  onOpenSidebar: () => void;
}

export function Menu({
  board,
  boardId,
  sortField,
  onSortFieldChange,
  filterText,
  onFilterTextChange,
  onRenameBoard,
  onOpenVoteSettings,
  onOpenNewColumn,
  onOpenSidebar,
}: MenuProps) {
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const votesLeft = remainingVotes(boardId, board.max_votes, board.messages);

  const saveBoardName = () => {
    onRenameBoard(newBoardName);
    setEditingBoardName(false);
  };

  return (
    <div className="menu">
      {!editingBoardName ? (
        <span
          className="board-name-container"
          onClick={() => {
            setNewBoardName(board.name);
            setEditingBoardName(true);
          }}
        >
          <h2 id="board-name" className="board-name">
            {board.name}
          </h2>
          <i className="fa fa-pencil"></i>
        </span>
      ) : (
        <span className="editing-board-name">
          <input
            title="edit the board name"
            value={newBoardName}
            autoFocus
            onChange={(event) => setNewBoardName(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                saveBoardName();
              }
            }}
          />
          <button className="success-button" onClick={saveBoardName}>
            Save
          </button>
          <a className="blue" onClick={() => setEditingBoardName(false)}>
            Cancel
          </a>
        </span>
      )}
      <label htmlFor="sortField" className="menu-controls">
        Sort by
      </label>
      <select
        id="sortField"
        title="sort fields by"
        value={sortField}
        onChange={(event) => onSortFieldChange(event.target.value as SortField)}
      >
        <option value="date_created">Created date</option>
        <option value="votes">Votes</option>
      </select>
      <input
        className="filter-message"
        placeholder="Filter your cards"
        aria-label="Filter your cards"
        value={filterText}
        onChange={(event) => onFilterTextChange(event.target.value)}
      />
      {votesLeft < board.max_votes && (
        <span className="remaining-votes">
          Remaining votes: <strong>{votesLeft}</strong>
          <span className="null-blank-space">&nbsp;</span>
          <span className="settings" onClick={onOpenVoteSettings}>
            <i className="fa fa-pencil fa-md"></i>
          </span>
        </span>
      )}
      <span className="pull-right menu-controls">
        <a
          className="header-icon"
          onClick={onOpenSidebar}
          aria-label="Open settings sidebar"
        >
          <i className="fa fa-gear"></i>{' '}
          <span className="header-icon-desc">settings</span>
        </a>
        {board.columns.length < MAX_COLUMNS && (
          <button className="pull-right new-column" onClick={onOpenNewColumn}>
            New column
          </button>
        )}
      </span>
    </div>
  );
}
