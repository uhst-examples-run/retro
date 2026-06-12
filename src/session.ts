import { UHST, InvalidHostId, HostIdAlreadyInUse } from 'uhst';
import { applyAction, type BoardAction, type ClientMessage, type HostMessage } from './protocol';
import { loadBoard, removeBoard, saveBoard } from './storage';
import type { Board } from './types';

type UhstHost = ReturnType<UHST['host']>;
type UhstSocket = ReturnType<UHST['join']>;

export type SessionStatus =
  | 'connecting'
  | 'connected'
  | 'not_found'
  | 'host_id_in_use'
  | 'closed'
  | 'deleted';

export interface SessionCallbacks {
  onBoard(board: Board): void;
  onStatus(status: SessionStatus): void;
}

export interface BoardSession {
  readonly isHost: boolean;
  dispatch(action: BoardAction): void;
  deleteBoard(): void;
  close(): void;
}

/**
 * Hosts a board over UHST. The hosting browser owns the board state:
 * it applies every action (its own and the ones received from joined
 * peers), persists the result to localStorage and broadcasts the new
 * state to everyone.
 */
class HostSession implements BoardSession {
  readonly isHost = true;
  private host: UhstHost;
  private board: Board;
  private deleted = false;

  constructor(
    private boardId: string,
    board: Board,
    private callbacks: SessionCallbacks
  ) {
    this.board = board;

    const uhst = new UHST();
    this.host = uhst.host(boardId);

    this.host.on('ready', () => {
      this.callbacks.onStatus('connected');
      this.callbacks.onBoard(this.board);
    });

    this.host.on('error', (error) => {
      if (error instanceof HostIdAlreadyInUse) {
        // Another tab is already hosting this board: join it instead.
        this.callbacks.onStatus('host_id_in_use');
      } else {
        console.error('UHST host error:', error);
      }
    });

    this.host.on('connection', (socket: UhstSocket) => {
      socket.on('message', (data: unknown) => {
        let message: ClientMessage;

        try {
          message = JSON.parse(String(data)) as ClientMessage;
        } catch {
          return;
        }

        switch (message.type) {
          case 'join':
            this.send(socket, { type: 'state', board: this.board });
            break;
          case 'action':
            this.dispatch(message.action);
            break;
        }
      });
    });
  }

  dispatch(action: BoardAction): void {
    if (this.deleted) {
      return;
    }

    this.board = applyAction(this.board, action);
    saveBoard(this.boardId, this.board);
    this.callbacks.onBoard(this.board);
    this.broadcast({ type: 'state', board: this.board });
  }

  deleteBoard(): void {
    this.deleted = true;
    removeBoard(this.boardId);
    this.broadcast({ type: 'board_deleted' });
    this.callbacks.onStatus('deleted');
  }

  close(): void {
    this.host.disconnect();
  }

  private send(socket: UhstSocket, message: HostMessage): void {
    socket.send(JSON.stringify(message)).catch((error: unknown) => {
      console.error('Failed to send to peer:', error);
    });
  }

  private broadcast(message: HostMessage): void {
    this.host.broadcast(JSON.stringify(message)).catch((error: unknown) => {
      console.error('Failed to broadcast:', error);
    });
  }
}

/**
 * Joins a board hosted by another peer. All mutations are sent to the
 * host as actions; the host answers with `state` broadcasts.
 */
class ClientSession implements BoardSession {
  readonly isHost = false;
  private socket: UhstSocket;
  private open = false;

  constructor(boardId: string, private callbacks: SessionCallbacks) {
    const uhst = new UHST();
    this.socket = uhst.join(boardId);

    this.socket.on('open', () => {
      this.open = true;
      this.sendToHost({ type: 'join' });
    });

    this.socket.on('message', (data: unknown) => {
      let message: HostMessage;

      try {
        message = JSON.parse(String(data)) as HostMessage;
      } catch {
        return;
      }

      switch (message.type) {
        case 'state':
          this.callbacks.onStatus('connected');
          this.callbacks.onBoard(message.board);
          break;
        case 'board_deleted':
          this.callbacks.onStatus('deleted');
          break;
      }
    });

    this.socket.on('error', (error: Error) => {
      if (error instanceof InvalidHostId) {
        this.callbacks.onStatus('not_found');
      } else {
        console.error('UHST client error:', error);
      }
    });

    this.socket.on('close', () => {
      this.callbacks.onStatus('closed');
    });
  }

  dispatch(action: BoardAction): void {
    this.sendToHost({ type: 'action', action });
  }

  deleteBoard(): void {
    // Only the hosting peer can delete a board.
  }

  close(): void {
    if (this.open) {
      this.socket.close();
    }
  }

  private sendToHost(message: ClientMessage): void {
    this.socket.send(JSON.stringify(message)).catch((error: unknown) => {
      console.error('Failed to send to host:', error);
    });
  }
}

/**
 * Opens a session for a board id: hosts it when this browser owns the
 * board (it is present in localStorage), joins it as a peer otherwise.
 * `forceClient` joins even an owned board, used when another tab of this
 * browser is already hosting it.
 */
export function openBoardSession(
  boardId: string,
  callbacks: SessionCallbacks,
  forceClient = false
): BoardSession {
  const ownBoard = forceClient ? null : loadBoard(boardId);

  if (ownBoard) {
    return new HostSession(boardId, ownBoard, callbacks);
  }

  return new ClientSession(boardId, callbacks);
}
