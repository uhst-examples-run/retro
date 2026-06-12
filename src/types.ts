export interface Column {
  id: number;
  value: string;
}

export interface Message {
  id: string;
  text: string;
  creating: boolean;
  type: { id: number };
  /** Last activity timestamp (updated on votes), epoch millis. */
  date: number;
  date_created: number;
  votes: number;
}

export interface Board {
  name: string;
  context: string;
  date_created: string;
  columns: Column[];
  max_votes: number;
  hide_vote: boolean;
  text_editing_is_private: boolean;
  messages: Message[];
}

export type SortField = 'date_created' | 'votes';

export const MAX_COLUMNS = 6;

export const DEFAULT_COLUMNS: Column[] = [
  { id: 1, value: 'Went well' },
  { id: 2, value: 'To improve' },
  { id: 3, value: 'Action items' },
];

export function createBoard(
  name: string,
  maxVotes: number,
  textEditingIsPrivate: boolean
): Board {
  return {
    name,
    context: '',
    date_created: new Date().toString(),
    columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
    max_votes: maxVotes,
    hide_vote: false,
    text_editing_is_private: textEditingIsPrivate,
    messages: [],
  };
}
