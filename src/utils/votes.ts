import type { Message } from '../types';

/**
 * Per-participant vote bookkeeping. Each browser tracks how many votes it
 * has spent on which card in localStorage (keyed by board id), exactly like
 * the original app did — the shared board only stores vote totals.
 */
type VoteMap = Record<string, number>;

function readVotes(boardId: string): VoteMap {
  const raw = localStorage.getItem(boardId);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as VoteMap;
  } catch {
    return {};
  }
}

function writeVotes(boardId: string, votes: VoteMap): void {
  localStorage.setItem(boardId, JSON.stringify(votes));
}

export function returnNumberOfVotesOnMessage(
  boardId: string,
  messageId: string
): number {
  return readVotes(boardId)[messageId] ?? 0;
}

export function returnNumberOfVotes(
  boardId: string,
  messageIds: string[]
): number {
  const votes = readVotes(boardId);

  return Object.keys(votes)
    .map((messageId) => (messageIds.includes(messageId) ? votes[messageId] : 0))
    .reduce((a, b) => a + b, 0);
}

export function remainingVotes(
  boardId: string,
  maxVotes: number,
  messages: Message[]
): number {
  const messageIds = messages.map((message) => message.id);

  return Math.max(maxVotes - returnNumberOfVotes(boardId, messageIds), 0);
}

export function isAbleToVote(
  boardId: string,
  maxVotes: number,
  messages: Message[]
): boolean {
  return remainingVotes(boardId, maxVotes, messages) > 0;
}

export function canUnvoteMessage(boardId: string, messageId: string): boolean {
  return returnNumberOfVotesOnMessage(boardId, messageId) > 0;
}

export function increaseMessageVotes(
  boardId: string,
  messageId: string
): void {
  const votes = readVotes(boardId);
  votes[messageId] = (votes[messageId] ?? 0) + 1;
  writeVotes(boardId, votes);
}

export function decreaseMessageVotes(
  boardId: string,
  messageId: string
): void {
  const votes = readVotes(boardId);

  if (!votes[messageId]) {
    return;
  }

  if (votes[messageId] <= 1) {
    delete votes[messageId];
  } else {
    votes[messageId] -= 1;
  }

  writeVotes(boardId, votes);
}

/** Move this participant's votes from a merged-away card onto the surviving one. */
export function mergeMessageVotes(
  boardId: string,
  sourceMessageId: string,
  targetMessageId: string
): void {
  const sourceVotes = returnNumberOfVotesOnMessage(boardId, sourceMessageId);

  if (sourceVotes === 0) {
    return;
  }

  const votes = readVotes(boardId);
  votes[targetMessageId] = sourceVotes + (votes[targetMessageId] ?? 0);
  delete votes[sourceMessageId];
  writeVotes(boardId, votes);
}
