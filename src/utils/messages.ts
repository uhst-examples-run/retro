import type { Message, SortField } from '../types';

export function columnClass(id: number): string {
  return 'column_' + (id % 6 || 6);
}

export function compareMessages(
  a: Message,
  b: Message,
  sortField: SortField
): number {
  if (sortField === 'votes' && a.votes !== b.votes) {
    return b.votes - a.votes;
  }

  return a.date_created - b.date_created;
}

export function sortMessages(
  messages: Message[],
  sortField: SortField
): Message[] {
  return [...messages].sort((a, b) => compareMessages(a, b, sortField));
}

export function filterMessages(
  messages: Message[],
  columnId: number,
  filterText: string
): Message[] {
  const needle = filterText.trim().toLowerCase();

  return messages.filter(
    (message) =>
      message.type.id === columnId &&
      (needle === '' || message.text.toLowerCase().includes(needle))
  );
}

export function newMessage(columnId: number): Message {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    text: '',
    creating: true,
    type: { id: columnId },
    date: now,
    date_created: now,
    votes: 0,
  };
}
