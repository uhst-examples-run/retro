import { useCallback, useRef, useState } from 'react';
import { useBoardSession } from '../hooks/useBoardSession';
import type { Message, SortField } from '../types';
import { newMessage } from '../utils/messages';
import {
  decreaseMessageVotes,
  increaseMessageVotes,
  isAbleToVote,
  canUnvoteMessage,
  mergeMessageVotes,
} from '../utils/votes';
import { BoardColumns } from './BoardColumns';
import { BoardContext } from './BoardContext';
import { Header } from './Header';
import { Menu } from './Menu';
import { Sidebar } from './Sidebar';
import { Spinner } from './Spinner';
import { DeleteBoardModal } from './modals/DeleteBoardModal';
import { DeleteCardModal } from './modals/DeleteCardModal';
import { DeleteCardsModal } from './modals/DeleteCardsModal';
import { DeleteColumnModal } from './modals/DeleteColumnModal';
import { ImportCsvModal } from './modals/ImportCsvModal';
import { MergeCardsModal } from './modals/MergeCardsModal';
import { NewColumnModal } from './modals/NewColumnModal';
import { PrivateWritingModal } from './modals/PrivateWritingModal';
import { VoteSettingsModal } from './modals/VoteSettingsModal';

export type BoardModal =
  | { kind: 'newColumn' }
  | { kind: 'deleteColumn'; columnId: number }
  | { kind: 'deleteCard'; messageId: string }
  | { kind: 'mergeCards'; sourceId: string; targetId: string }
  | { kind: 'deleteCards' }
  | { kind: 'deleteBoard' }
  | { kind: 'voteSettings' }
  | { kind: 'privateWriting' }
  | { kind: 'importCsv' };

interface BoardPageProps {
  boardId: string;
  onNewBoard: () => void;
}

function initialSortField(): SortField {
  const sort = new URLSearchParams(window.location.search).get('sort');
  return sort === 'votes' ? 'votes' : 'date_created';
}

export function BoardPage({ boardId, onNewBoard }: BoardPageProps) {
  const { board, status, dispatch, deleteBoard } = useBoardSession(boardId);
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [filterText, setFilterText] = useState('');
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [modal, setModal] = useState<BoardModal | null>(null);
  const [autoEditId, setAutoEditId] = useState<string | null>(null);
  // Bumped whenever this participant's local vote bookkeeping changes,
  // so remaining-vote indicators recompute.
  const [, setVoteVersion] = useState(0);
  const draggedMessageId = useRef<string | null>(null);

  const closeModal = useCallback(() => setModal(null), []);
  const bumpVotes = useCallback(() => setVoteVersion((v) => v + 1), []);

  const goHome = () => {
    window.location.hash = '';
  };

  const updateSortOrder = (field: SortField) => {
    setSortField(field);
    const updatedUrl =
      window.location.origin +
      window.location.pathname +
      '?sort=' +
      field +
      window.location.hash;
    window.history.pushState({ path: updatedUrl }, '', updatedUrl);
  };

  const addNewMessage = (columnId: number) => {
    const message = newMessage(columnId);
    dispatch({ type: 'addMessage', message });
    setAutoEditId(message.id);
  };

  const vote = (message: Message) => {
    if (board && isAbleToVote(boardId, board.max_votes, board.messages)) {
      dispatch({ type: 'vote', id: message.id });
      increaseMessageVotes(boardId, message.id);
      bumpVotes();
    }
  };

  const unvote = (message: Message) => {
    if (canUnvoteMessage(boardId, message.id)) {
      dispatch({ type: 'unvote', id: message.id });
      decreaseMessageVotes(boardId, message.id);
      bumpVotes();
    }
  };

  if (status === 'not_found') {
    return (
      <BoardUnavailable
        title="Board not found"
        description="Nobody is hosting this board right now. Boards live in the
          browser of the person who created them, so they are only available
          while that browser is online."
      />
    );
  }

  if (status === 'deleted') {
    return (
      <BoardUnavailable
        title="Board deleted"
        description="This board was deleted by its owner."
      />
    );
  }

  if (status === 'closed') {
    return (
      <BoardUnavailable
        title="Connection closed"
        description="The connection to the board's host was closed. The host
          may have gone offline, or this board may be hosted in another tab."
      />
    );
  }

  if (status === 'connecting' || !board) {
    return <Spinner />;
  }

  return (
    <>
      <Header onNewBoard={onNewBoard} />
      <Menu
        board={board}
        boardId={boardId}
        sortField={sortField}
        onSortFieldChange={updateSortOrder}
        filterText={filterText}
        onFilterTextChange={setFilterText}
        onRenameBoard={(name) => dispatch({ type: 'setBoardName', name })}
        onOpenVoteSettings={() => setModal({ kind: 'voteSettings' })}
        onOpenNewColumn={() => setModal({ kind: 'newColumn' })}
        onOpenSidebar={() => setSidebarOpened(true)}
      />
      <BoardContext
        context={board.context}
        onChange={(context) => dispatch({ type: 'setBoardContext', context })}
      />
      <main>
        <BoardColumns
          board={board}
          boardId={boardId}
          sortField={sortField}
          filterText={filterText}
          autoEditId={autoEditId}
          draggedMessageId={draggedMessageId}
          dispatch={dispatch}
          onAddMessage={addNewMessage}
          onVote={vote}
          onUnvote={unvote}
          onDeleteCard={(messageId) => setModal({ kind: 'deleteCard', messageId })}
          onDeleteColumn={(columnId) => setModal({ kind: 'deleteColumn', columnId })}
          onOpenNewColumn={() => setModal({ kind: 'newColumn' })}
          onMergeCards={(sourceId, targetId) =>
            setModal({ kind: 'mergeCards', sourceId, targetId })
          }
        />
      </main>
      <Sidebar
        opened={sidebarOpened}
        onClose={() => setSidebarOpened(false)}
        board={board}
        sortField={sortField}
        onOpenImport={() => setModal({ kind: 'importCsv' })}
        onOpenVoteSettings={() => setModal({ kind: 'voteSettings' })}
        onOpenPrivateWriting={() => setModal({ kind: 'privateWriting' })}
        onOpenDeleteCards={() => setModal({ kind: 'deleteCards' })}
        onOpenDeleteBoard={() => setModal({ kind: 'deleteBoard' })}
      />
      {modal?.kind === 'newColumn' && (
        <NewColumnModal
          onAdd={(name) => {
            dispatch({ type: 'addColumn', name });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'deleteColumn' && (
        <DeleteColumnModal
          onDelete={() => {
            dispatch({ type: 'deleteColumn', id: modal.columnId });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'deleteCard' && (
        <DeleteCardModal
          onDelete={() => {
            dispatch({ type: 'deleteMessage', id: modal.messageId });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'mergeCards' && (
        <MergeCardsModal
          onMerge={() => {
            dispatch({
              type: 'mergeMessages',
              sourceId: modal.sourceId,
              targetId: modal.targetId,
            });
            mergeMessageVotes(boardId, modal.sourceId, modal.targetId);
            bumpVotes();
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'deleteCards' && (
        <DeleteCardsModal
          onDelete={() => {
            dispatch({ type: 'deleteAllMessages' });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'deleteBoard' && (
        <DeleteBoardModal
          onDelete={() => {
            deleteBoard();
            closeModal();
            goHome();
          }}
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'voteSettings' && (
        <VoteSettingsModal
          maxVotes={board.max_votes}
          hideVote={board.hide_vote}
          onIncrement={() =>
            dispatch({ type: 'setMaxVotes', maxVotes: board.max_votes + 1 })
          }
          onDecrement={() =>
            dispatch({ type: 'setMaxVotes', maxVotes: board.max_votes - 1 })
          }
          onToggleHideVote={() =>
            dispatch({ type: 'setHideVote', hideVote: !board.hide_vote })
          }
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'privateWriting' && (
        <PrivateWritingModal
          isPrivate={board.text_editing_is_private}
          onToggle={(isPrivate) =>
            dispatch({ type: 'setPrivateWriting', isPrivate })
          }
          onClose={closeModal}
        />
      )}
      {modal?.kind === 'importCsv' && (
        <ImportCsvModal
          board={board}
          onImport={(messages) => {
            dispatch({ type: 'importMessages', messages });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
    </>
  );
}

function BoardUnavailable({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="home">
      <section>
        <h1>
          <small>{title}</small>
        </h1>
        <p>{description}</p>
        <button
          onClick={() => {
            window.location.hash = '';
          }}
        >
          GO HOME
        </button>
      </section>
    </div>
  );
}
