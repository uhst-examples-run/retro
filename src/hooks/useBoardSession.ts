import { useCallback, useEffect, useRef, useState } from 'react';
import type { BoardAction } from '../protocol';
import {
  openBoardSession,
  type BoardSession,
  type SessionStatus,
} from '../session';
import type { Board } from '../types';

export interface BoardSessionState {
  board: Board | null;
  status: SessionStatus;
  isHost: boolean;
  dispatch: (action: BoardAction) => void;
  deleteBoard: () => void;
}

export function useBoardSession(boardId: string): BoardSessionState {
  const [board, setBoard] = useState<Board | null>(null);
  const [status, setStatus] = useState<SessionStatus>('connecting');
  const [isHost, setIsHost] = useState(false);
  // Set when another tab of this browser already hosts the board:
  // reopen the session as a regular peer instead.
  const [forceClient, setForceClient] = useState(false);
  const sessionRef = useRef<BoardSession | null>(null);

  useEffect(() => {
    setBoard(null);
    setStatus('connecting');

    const session = openBoardSession(
      boardId,
      {
        onBoard: setBoard,
        onStatus: (newStatus) => {
          if (newStatus === 'host_id_in_use') {
            setForceClient(true);
          } else {
            setStatus(newStatus);
          }
        },
      },
      forceClient
    );

    sessionRef.current = session;
    setIsHost(session.isHost);

    return () => {
      sessionRef.current = null;
      session.close();
    };
  }, [boardId, forceClient]);

  const dispatch = useCallback((action: BoardAction) => {
    sessionRef.current?.dispatch(action);
  }, []);

  const deleteBoard = useCallback(() => {
    sessionRef.current?.deleteBoard();
  }, []);

  return { board, status, isHost, dispatch, deleteBoard };
}
