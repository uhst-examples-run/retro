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
  /** Fired when hosting a brand new board, once the relay assigns its id. */
  onBoardId?(boardId: string): void;
}

export interface BoardSession {
  readonly isHost: boolean;
  /**
   * The board id. Known up front when joining or re-hosting; for a new
   * board it is null until the relay assigns one (see onBoardId).
   */
  readonly boardId: string | null;
  dispatch(action: BoardAction): void;
  deleteBoard(): void;
  close(): void;
}

/**
 * Hosts a board over UHST. The hosting browser owns the board state:
 * it applies every action (its own and the ones received from joined
 * peers), persists the result to localStorage and broadcasts the new
 * state to everyone.
 *
 * Host ids are assigned by the UHST relay (they encode which relay
 * serves the host), so a new board is hosted without requesting an id
 * and adopts the one delivered with the 'ready' event. Only when
 * re-hosting an existing board do we request its previously assigned id.
 */
class HostSession implements BoardSession {
  readonly isHost = true;
  boardId: string | null;
  private host: UhstHost;
  private board: Board;
  private deleted = false;
  private ready = false;

  constructor(
    board: Board,
    private callbacks: SessionCallbacks,
    boardId?: string
  ) {
    this.board = board;
    this.boardId = boardId ?? null;

    const uhst = new UHST();
    this.host = uhst.host(boardId);

    this.host.on('ready', () => {
      this.ready = true;

      if (this.boardId === null) {
        this.boardId = this.host.hostId;
        saveBoard(this.boardId, this.board);
        this.callbacks.onBoardId?.(this.boardId);
      }

      this.callbacks.onStatus('connected');
      this.callbacks.onBoard(this.board);
    });

    this.host.on('error', (error) => {
      if (error instanceof HostIdAlreadyInUse) {
        // Another tab is already hosting this board: join it instead.
        this.callbacks.onStatus('host_id_in_use');
      } else {
        console.error('UHST host error:', error);
        if (!this.ready) {
          this.callbacks.onStatus('closed');
        }
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
    if (this.deleted || this.boardId === null) {
      return;
    }

    this.board = applyAction(this.board, action);
    saveBoard(this.boardId, this.board);
    this.callbacks.onBoard(this.board);
    this.broadcast({ type: 'state', board: this.board });
  }

  deleteBoard(): void {
    this.deleted = true;

    if (this.boardId !== null) {
      removeBoard(this.boardId);
    }

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
  readonly boardId: string;
  private socket: UhstSocket;
  private open = false;

  constructor(boardId: string, private callbacks: SessionCallbacks) {
    this.boardId = boardId;
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
    return new HostSession(ownBoard, callbacks, boardId);
  }

  return new ClientSession(boardId, callbacks);
}

/**
 * Starts hosting a brand new board. The relay assigns the board id;
 * it is reported through `callbacks.onBoardId` once known.
 */
export function createBoardSession(
  board: Board,
  callbacks: SessionCallbacks
): BoardSession {
  return new HostSession(board, callbacks);
}
