import { useState } from 'react';
import { BoardPage } from './components/BoardPage';
import { Home } from './components/Home';
import { Spinner } from './components/Spinner';
import { NewBoardModal } from './components/modals/NewBoardModal';
import { createBoard } from './types';
import { useBoardSession } from './hooks/useBoardSession';
import { useHash } from './hooks/useHash';

export function App() {
  const boardId = useHash();
  const session = useBoardSession(boardId);
  const [showNewBoard, setShowNewBoard] = useState(false);

  const createNewBoard = (
    name: string,
    maxVotes: number,
    textEditingIsPrivate: boolean
  ) => {
    setShowNewBoard(false);
    // The UHST relay assigns the board id; the session puts it in the
    // URL hash once hosting is ready.
    session.createNewBoard(createBoard(name, maxVotes, textEditingIsPrivate));
  };

  return (
    <>
      {boardId === '' ? (
        session.creating ? (
          <Spinner />
        ) : (
          <Home onNewBoard={() => setShowNewBoard(true)} />
        )
      ) : (
        <BoardPage
          key={boardId}
          boardId={boardId}
          session={session}
          onNewBoard={() => setShowNewBoard(true)}
        />
      )}
      {showNewBoard && (
        <NewBoardModal
          onCreate={createNewBoard}
          onClose={() => setShowNewBoard(false)}
        />
      )}
    </>
  );
}
