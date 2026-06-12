import { beforeEach, describe, expect, it } from 'vitest';
import type { Message } from '../types';
import {
  canUnvoteMessage,
  decreaseMessageVotes,
  increaseMessageVotes,
  isAbleToVote,
  mergeMessageVotes,
  remainingVotes,
  returnNumberOfVotesOnMessage,
} from './votes';

const BOARD_ID = 'board1';

function message(id: string): Message {
  return {
    id,
    text: '',
    creating: false,
    type: { id: 1 },
    date: 0,
    date_created: 0,
    votes: 0,
  };
}

describe('vote bookkeeping', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with zero votes on a message', () => {
    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'm1')).toBe(0);
  });

  it('increases and decreases votes on a message', () => {
    increaseMessageVotes(BOARD_ID, 'm1');
    increaseMessageVotes(BOARD_ID, 'm1');
    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'm1')).toBe(2);

    decreaseMessageVotes(BOARD_ID, 'm1');
    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'm1')).toBe(1);

    decreaseMessageVotes(BOARD_ID, 'm1');
    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'm1')).toBe(0);
  });

  it('computes remaining votes only counting messages still on the board', () => {
    increaseMessageVotes(BOARD_ID, 'm1');
    increaseMessageVotes(BOARD_ID, 'm2');
    increaseMessageVotes(BOARD_ID, 'deleted');

    expect(remainingVotes(BOARD_ID, 6, [message('m1'), message('m2')])).toBe(4);
  });

  it('never returns negative remaining votes', () => {
    increaseMessageVotes(BOARD_ID, 'm1');
    increaseMessageVotes(BOARD_ID, 'm1');

    expect(remainingVotes(BOARD_ID, 1, [message('m1')])).toBe(0);
  });

  it('only allows voting while votes remain', () => {
    expect(isAbleToVote(BOARD_ID, 1, [message('m1')])).toBe(true);

    increaseMessageVotes(BOARD_ID, 'm1');
    expect(isAbleToVote(BOARD_ID, 1, [message('m1')])).toBe(false);
  });

  it('only allows unvoting messages this user voted on', () => {
    expect(canUnvoteMessage(BOARD_ID, 'm1')).toBe(false);

    increaseMessageVotes(BOARD_ID, 'm1');
    expect(canUnvoteMessage(BOARD_ID, 'm1')).toBe(true);
  });

  it('moves votes to the surviving card when merging', () => {
    increaseMessageVotes(BOARD_ID, 'source');
    increaseMessageVotes(BOARD_ID, 'source');
    increaseMessageVotes(BOARD_ID, 'target');

    mergeMessageVotes(BOARD_ID, 'source', 'target');

    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'source')).toBe(0);
    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'target')).toBe(3);
  });

  it('keeps target votes untouched when source has no votes', () => {
    increaseMessageVotes(BOARD_ID, 'target');

    mergeMessageVotes(BOARD_ID, 'source', 'target');

    expect(returnNumberOfVotesOnMessage(BOARD_ID, 'target')).toBe(1);
  });
});
