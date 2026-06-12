import type { Board, Message } from './types';

/**
 * Actions describe every mutation that can happen to a board. Clients send
 * actions to the host over UHST; the host applies them with `applyAction`
 * and broadcasts the resulting board state back to every peer.
 */
export type BoardAction =
  | { type: 'addMessage'; message: Message }
  | { type: 'updateMessageText'; id: string; text: string }
  | { type: 'setMessageCreating'; id: string; creating: boolean }
  | { type: 'deleteMessage'; id: string }
  | { type: 'deleteAllMessages' }
  | { type: 'moveMessage'; id: string; columnId: number }
  | { type: 'mergeMessages'; sourceId: string; targetId: string }
  | { type: 'vote'; id: string }
  | { type: 'unvote'; id: string }
  | { type: 'setBoardName'; name: string }
  | { type: 'setBoardContext'; context: string }
  | { type: 'setMaxVotes'; maxVotes: number }
  | { type: 'setHideVote'; hideVote: boolean }
  | { type: 'setPrivateWriting'; isPrivate: boolean }
  | { type: 'addColumn'; name: string }
  | { type: 'renameColumn'; id: number; name: string }
  | { type: 'deleteColumn'; id: number }
  | { type: 'importMessages'; messages: { text: string; columnId: number }[] };

/** Messages sent from a joined peer to the board host. */
export type ClientMessage =
  | { type: 'join' }
  | { type: 'action'; action: BoardAction };

/** Messages sent from the board host to joined peers. */
export type HostMessage =
  | { type: 'state'; board: Board }
  | { type: 'board_deleted' };

export function getNextColumnId(board: Board): number {
  return board.columns.reduce((max, column) => Math.max(max, column.id), 0) + 1;
}

function updateMessage(
  board: Board,
  id: string,
  update: (message: Message) => Message
): Board {
  return {
    ...board,
    messages: board.messages.map((message) =>
      message.id === id ? update(message) : message
    ),
  };
}

export function applyAction(board: Board, action: BoardAction): Board {
  switch (action.type) {
    case 'addMessage':
      return { ...board, messages: [...board.messages, action.message] };

    case 'updateMessageText':
      return updateMessage(board, action.id, (message) => ({
        ...message,
        text: action.text,
      }));

    case 'setMessageCreating':
      return updateMessage(board, action.id, (message) => ({
        ...message,
        creating: action.creating,
      }));

    case 'deleteMessage':
      return {
        ...board,
        messages: board.messages.filter((message) => message.id !== action.id),
      };

    case 'deleteAllMessages':
      return { ...board, messages: [] };

    case 'moveMessage':
      return updateMessage(board, action.id, (message) => ({
        ...message,
        type: { id: action.columnId },
      }));

    case 'mergeMessages': {
      const source = board.messages.find((m) => m.id === action.sourceId);
      const target = board.messages.find((m) => m.id === action.targetId);

      if (!source || !target || source.id === target.id) {
        return board;
      }

      return {
        ...board,
        messages: board.messages
          .filter((message) => message.id !== source.id)
          .map((message) =>
            message.id === target.id
              ? {
                  ...message,
                  text: target.text + '\n' + source.text,
                  votes: target.votes + source.votes,
                }
              : message
          ),
      };
    }

    case 'vote':
      return updateMessage(board, action.id, (message) => ({
        ...message,
        votes: message.votes + 1,
        date: Date.now(),
      }));

    case 'unvote':
      return updateMessage(board, action.id, (message) => ({
        ...message,
        votes: Math.max(message.votes - 1, 0),
        date: Date.now(),
      }));

    case 'setBoardName':
      return { ...board, name: action.name };

    case 'setBoardContext':
      return { ...board, context: action.context };

    case 'setMaxVotes':
      return { ...board, max_votes: Math.min(Math.max(action.maxVotes, 1), 99) };

    case 'setHideVote':
      return { ...board, hide_vote: action.hideVote };

    case 'setPrivateWriting':
      return { ...board, text_editing_is_private: action.isPrivate };

    case 'addColumn':
      return {
        ...board,
        columns: [
          ...board.columns,
          { id: getNextColumnId(board), value: action.name },
        ],
      };

    case 'renameColumn':
      return {
        ...board,
        columns: board.columns.map((column) =>
          column.id === action.id ? { ...column, value: action.name } : column
        ),
      };

    case 'deleteColumn':
      return {
        ...board,
        columns: board.columns.filter((column) => column.id !== action.id),
      };

    case 'importMessages': {
      const now = Date.now();
      const imported: Message[] = action.messages.map((entry, index) => ({
        id: crypto.randomUUID(),
        text: entry.text,
        creating: false,
        type: { id: entry.columnId },
        date: now + index,
        date_created: now + index,
        votes: 0,
      }));

      return { ...board, messages: [...board.messages, ...imported] };
    }
  }
}
