import { useCallback, useEffect, useRef, useState } from 'react';
import type { BoardAction } from '../protocol';
import {
  createBoardSession,
  openBoardSession,
  type BoardSession,
  type SessionStatus,
} from '../session';
import type { Board } from '../types';

export interface BoardSessionState {
  board: Board | null;
  status: SessionStatus;
  isHost: boolean;
  /** True while hosting a new board whose id the relay has not assigned yet. */
  creating: boolean;
  dispatch: (action: BoardAction) => void;
  deleteBoard: () => void;
  createNewBoard: (board: Board) => void;
}

export function useBoardSession(boardId: string): BoardSessionState {
  const [board, setBoard] = useState<Board | null>(null);
  const [status, setStatus] = useState<SessionStatus>('connecting');
  const [isHost, setIsHost] = useState(false);
  const [creating, setCreating] = useState(false);
  const sessionRef = useRef<BoardSession | null>(null);

  const open = useCallback((id: string, forceClient: boolean) => {
    const session = openBoardSession(
      id,
      {
        onBoard: setBoard,
        onStatus: (newStatus) => {
          if (newStatus === 'host_id_in_use') {
            // Another tab of this browser already hosts the board:
            // reopen the session as a regular peer instead.
            sessionRef.current?.close();
            open(id, true);
          } else {
            setStatus(newStatus);
          }
        },
      },
      forceClient
    );

    sessionRef.current = session;
    setIsHost(session.isHost);
  }, []);

  useEffect(() => {
    // Adopt the session started by createNewBoard once the relay-assigned
    // id lands in the URL hash; don't tear it down and reconnect.
    if (boardId !== '' && sessionRef.current?.boardId === boardId) {
      setCreating(false);
      return;
    }

    sessionRef.current?.close();
    sessionRef.current = null;
    setBoard(null);
    setStatus('connecting');
    setCreating(false);
    setIsHost(false);

    if (boardId !== '') {
      open(boardId, false);
    }
  }, [boardId, open]);

  useEffect(
    () => () => {
      sessionRef.current?.close();
      sessionRef.current = null;
    },
    []
  );

  const createNewBoard = useCallback((newBoard: Board) => {
    sessionRef.current?.close();
    setBoard(null);
    setStatus('connecting');
    setCreating(true);
    setIsHost(true);

    sessionRef.current = createBoardSession(newBoard, {
      onBoard: setBoard,
      onStatus: setStatus,
      onBoardId: (assignedId) => {
        // The hash change re-renders the app; the effect above adopts
        // this session because its boardId now matches the hash.
        window.location.hash = assignedId;
      },
    });
  }, []);

  const dispatch = useCallback((action: BoardAction) => {
    sessionRef.current?.dispatch(action);
  }, []);

  const deleteBoard = useCallback(() => {
    sessionRef.current?.deleteBoard();
  }, []);

  return {
    board,
    status,
    isHost,
    creating,
    dispatch,
    deleteBoard,
    createNewBoard,
  };
}
