import type { Board } from './types';

const BOARD_KEY_PREFIX = 'retro:board:';

/**
 * Boards live in the browser of the peer that created them (the UHST host).
 * The host persists its board here so it survives reloads; the presence of
 * a stored board is also how we know to host a board id instead of joining it.
 */
export function loadBoard(boardId: string): Board | null {
  const raw = localStorage.getItem(BOARD_KEY_PREFIX + boardId);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Board;
  } catch {
    return null;
  }
}

export function saveBoard(boardId: string, board: Board): void {
  localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(board));
}

export function removeBoard(boardId: string): void {
  localStorage.removeItem(BOARD_KEY_PREFIX + boardId);
}
