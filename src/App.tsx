import { useState } from 'react';
import { BoardPage } from './components/BoardPage';
import { Home } from './components/Home';
import { NewBoardModal } from './components/modals/NewBoardModal';
import { createBoardId, saveBoard } from './storage';
import { createBoard } from './types';
import { useHash } from './hooks/useHash';

export function App() {
  const boardId = useHash();
  const [showNewBoard, setShowNewBoard] = useState(false);

  const createNewBoard = (
    name: string,
    maxVotes: number,
    textEditingIsPrivate: boolean
  ) => {
    const id = createBoardId();
    saveBoard(id, createBoard(name, maxVotes, textEditingIsPrivate));
    setShowNewBoard(false);
    window.location.hash = id;
  };

  return (
    <>
      {boardId === '' ? (
        <Home onNewBoard={() => setShowNewBoard(true)} />
      ) : (
        <BoardPage
          key={boardId}
          boardId={boardId}
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
