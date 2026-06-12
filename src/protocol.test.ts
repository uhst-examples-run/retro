import { describe, expect, it } from 'vitest';
import { applyAction, getNextColumnId } from './protocol';
import { createBoard, type Board, type Message } from './types';

function message(id: string, overrides: Partial<Message> = {}): Message {
  return {
    id,
    text: '',
    creating: false,
    type: { id: 1 },
    date: 0,
    date_created: 0,
    votes: 0,
    ...overrides,
  };
}

function boardWith(messages: Message[]): Board {
  return { ...createBoard('Test board', 6, true), messages };
}

describe('applyAction', () => {
  it('adds a message', () => {
    const board = applyAction(boardWith([]), {
      type: 'addMessage',
      message: message('m1'),
    });

    expect(board.messages).toHaveLength(1);
    expect(board.messages[0].id).toBe('m1');
  });

  it('updates message text', () => {
    const board = applyAction(boardWith([message('m1')]), {
      type: 'updateMessageText',
      id: 'm1',
      text: 'hello',
    });

    expect(board.messages[0].text).toBe('hello');
  });

  it('deletes a message', () => {
    const board = applyAction(boardWith([message('m1'), message('m2')]), {
      type: 'deleteMessage',
      id: 'm1',
    });

    expect(board.messages.map((m) => m.id)).toEqual(['m2']);
  });

  it('moves a message to another column', () => {
    const board = applyAction(boardWith([message('m1')]), {
      type: 'moveMessage',
      id: 'm1',
      columnId: 3,
    });

    expect(board.messages[0].type.id).toBe(3);
  });

  it('merges two messages, combining text and votes', () => {
    const board = applyAction(
      boardWith([
        message('drag', { text: 'dragged', votes: 2 }),
        message('drop', { text: 'dropped', votes: 1 }),
      ]),
      { type: 'mergeMessages', sourceId: 'drag', targetId: 'drop' }
    );

    expect(board.messages).toHaveLength(1);
    expect(board.messages[0].id).toBe('drop');
    expect(board.messages[0].text).toBe('dropped\ndragged');
    expect(board.messages[0].votes).toBe(3);
  });

  it('ignores merging a message into itself', () => {
    const original = boardWith([message('m1', { votes: 1 })]);
    const board = applyAction(original, {
      type: 'mergeMessages',
      sourceId: 'm1',
      targetId: 'm1',
    });

    expect(board.messages).toHaveLength(1);
    expect(board.messages[0].votes).toBe(1);
  });

  it('votes and unvotes, never dropping below zero', () => {
    let board = applyAction(boardWith([message('m1')]), {
      type: 'vote',
      id: 'm1',
    });
    expect(board.messages[0].votes).toBe(1);

    board = applyAction(board, { type: 'unvote', id: 'm1' });
    board = applyAction(board, { type: 'unvote', id: 'm1' });
    expect(board.messages[0].votes).toBe(0);
  });

  it('clamps max votes between 1 and 99', () => {
    expect(
      applyAction(boardWith([]), { type: 'setMaxVotes', maxVotes: 0 }).max_votes
    ).toBe(1);
    expect(
      applyAction(boardWith([]), { type: 'setMaxVotes', maxVotes: 100 })
        .max_votes
    ).toBe(99);
  });

  it('adds, renames and deletes columns', () => {
    let board = applyAction(boardWith([]), {
      type: 'addColumn',
      name: 'Kudos',
    });
    expect(board.columns).toHaveLength(4);
    expect(board.columns[3]).toEqual({ id: 4, value: 'Kudos' });

    board = applyAction(board, { type: 'renameColumn', id: 4, name: 'Praise' });
    expect(board.columns[3].value).toBe('Praise');

    board = applyAction(board, { type: 'deleteColumn', id: 4 });
    expect(board.columns).toHaveLength(3);
  });

  it('imports messages into mapped columns', () => {
    const board = applyAction(boardWith([]), {
      type: 'importMessages',
      messages: [
        { text: 'first', columnId: 1 },
        { text: 'second', columnId: 2 },
      ],
    });

    expect(board.messages).toHaveLength(2);
    expect(board.messages[0]).toMatchObject({ text: 'first', votes: 0 });
    expect(board.messages[1].type.id).toBe(2);
  });
});

describe('getNextColumnId', () => {
  it('returns one more than the highest column id', () => {
    const board = boardWith([]);
    expect(getNextColumnId(board)).toBe(4);

    const afterDelete = applyAction(board, { type: 'deleteColumn', id: 3 });
    expect(getNextColumnId(afterDelete)).toBe(3);
  });
});
