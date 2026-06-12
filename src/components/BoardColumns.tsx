import { useState, type RefObject } from 'react';
import type { BoardAction } from '../protocol';
import type { Board, Column, Message } from '../types';
import { MAX_COLUMNS } from '../types';
import { columnClass, filterMessages, sortMessages } from '../utils/messages';
import { MessageCard } from './MessageCard';

interface BoardColumnsProps {
  board: Board;
  boardId: string;
  sortField: 'date_created' | 'votes';
  filterText: string;
  autoEditId: string | null;
  draggedMessageId: RefObject<string | null>;
  dispatch: (action: BoardAction) => void;
  onAddMessage: (columnId: number) => void;
  onVote: (message: Message) => void;
  onUnvote: (message: Message) => void;
  onDeleteCard: (messageId: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onOpenNewColumn: () => void;
  onMergeCards: (sourceId: string, targetId: string) => void;
}

export function BoardColumns(props: BoardColumnsProps) {
  const { board, onOpenNewColumn } = props;
  const [selectedColumnId, setSelectedColumnId] = useState(
    board.columns[0]?.id ?? 1
  );

  return (
    <>
      <div className="filter-mobile">
        <label htmlFor="selectedType">Filter by</label>
        <select
          id="selectedType"
          title="select column type"
          value={selectedColumnId}
          onChange={(event) => setSelectedColumnId(Number(event.target.value))}
        >
          {board.columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.value}
            </option>
          ))}
        </select>
        {board.columns.length < MAX_COLUMNS && (
          <button className="pull-right new-column" onClick={onOpenNewColumn}>
            New column
          </button>
        )}
      </div>
      <span className="container">
        {board.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            selected={column.id === selectedColumnId}
            {...props}
          />
        ))}
      </span>
    </>
  );
}

interface BoardColumnProps extends BoardColumnsProps {
  column: Column;
  selected: boolean;
}

function BoardColumn({
  board,
  boardId,
  column,
  selected,
  sortField,
  filterText,
  autoEditId,
  draggedMessageId,
  dispatch,
  onAddMessage,
  onVote,
  onUnvote,
  onDeleteCard,
  onDeleteColumn,
  onMergeCards,
}: BoardColumnProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [dragOver, setDragOver] = useState(0);

  const messages = sortMessages(
    filterMessages(board.messages, column.id, filterText),
    sortField
  );

  const saveColumnName = () => {
    if (newName !== '') {
      dispatch({ type: 'renameColumn', id: column.id, name: newName });
    }
    setEditing(false);
  };

  return (
    <span
      className={
        'message-list' +
        (selected ? ' selected' : '') +
        (dragOver > 0 ? ' lvl-over' : '')
      }
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragOver((count) => count + 1);
      }}
      onDragLeave={() => setDragOver((count) => Math.max(count - 1, 0))}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(0);
        const messageId =
          event.dataTransfer.getData('text/plain') || draggedMessageId.current;
        if (messageId) {
          dispatch({ type: 'moveMessage', id: messageId, columnId: column.id });
        }
        draggedMessageId.current = null;
      }}
    >
      <ul className={'column ' + columnClass(column.id)}>
        <div className="column-header">
          {!editing && (
            <>
              {board.columns.length > 1 && (
                <a
                  className="controls delete"
                  onClick={() => onDeleteColumn(column.id)}
                  aria-label="Delete column"
                >
                  <i className="fa fa-times"></i>
                </a>
              )}
              <h2
                onClick={() => {
                  setNewName(column.value);
                  setEditing(true);
                }}
              >
                {column.value}
              </h2>
              <a
                className="add"
                onClick={() => onAddMessage(column.id)}
                aria-label="Add new message"
              >
                <i className="fa fa-plus"></i>
              </a>
            </>
          )}
          {editing && (
            <div className="editing-column">
              <input
                id={'new_name_' + column.id}
                value={newName}
                autoFocus
                onChange={(event) => setNewName(event.target.value)}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    saveColumnName();
                  }
                }}
              />
              <div>
                <button className="success-button" onClick={saveColumnName}>
                  Save
                </button>
                <a className="blue" onClick={() => setEditing(false)}>
                  Cancel
                </a>
              </div>
            </div>
          )}
        </div>
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            board={board}
            boardId={boardId}
            startEditing={message.id === autoEditId}
            draggedMessageId={draggedMessageId}
            dispatch={dispatch}
            onVote={onVote}
            onUnvote={onUnvote}
            onDelete={onDeleteCard}
            onMergeCards={onMergeCards}
          />
        ))}
      </ul>
    </span>
  );
}
