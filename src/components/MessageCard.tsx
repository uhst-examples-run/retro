import { useState, type ReactNode, type RefObject } from 'react';
import type { BoardAction } from '../protocol';
import type { Board, Message } from '../types';
import {
  canUnvoteMessage,
  isAbleToVote,
  returnNumberOfVotesOnMessage,
} from '../utils/votes';

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(URL_PATTERN).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      part
    )
  );
}

interface MessageCardProps {
  message: Message;
  board: Board;
  boardId: string;
  startEditing: boolean;
  draggedMessageId: RefObject<string | null>;
  dispatch: (action: BoardAction) => void;
  onVote: (message: Message) => void;
  onUnvote: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onMergeCards: (sourceId: string, targetId: string) => void;
}

export function MessageCard({
  message,
  board,
  boardId,
  startEditing,
  draggedMessageId,
  dispatch,
  onVote,
  onUnvote,
  onDelete,
  onMergeCards,
}: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(startEditing);
  const [draft, setDraft] = useState(message.text);
  const [dragOver, setDragOver] = useState(0);

  const isCensored = message.creating && board.text_editing_is_private;
  const ownVotes = returnNumberOfVotesOnMessage(boardId, message.id);
  const ableToVote = isAbleToVote(boardId, board.max_votes, board.messages);

  const beginEditing = () => {
    setDraft(message.text);
    setIsEditing(true);
    dispatch({ type: 'setMessageCreating', id: message.id, creating: true });
  };

  const updateDraft = (text: string) => {
    setDraft(text);
    dispatch({ type: 'updateMessageText', id: message.id, text });
  };

  const finishEditing = () => {
    setIsEditing(false);
    dispatch({ type: 'updateMessageText', id: message.id, text: draft });
    dispatch({ type: 'setMessageCreating', id: message.id, creating: false });
  };

  return (
    <li id={message.id} className={'message' + (isEditing ? ' flip' : '')}>
      <div
        draggable={!isEditing}
        className={dragOver > 0 ? 'lvl-over' : undefined}
        onDragStart={(event) => {
          draggedMessageId.current = message.id;
          event.dataTransfer.setData('text/plain', message.id);
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragOver((count) => count + 1);
        }}
        onDragLeave={() => setDragOver((count) => Math.max(count - 1, 0))}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(0);
          const sourceId =
            event.dataTransfer.getData('text/plain') ||
            draggedMessageId.current;
          draggedMessageId.current = null;
          if (sourceId && sourceId !== message.id) {
            onMergeCards(sourceId, message.id);
          }
        }}
      >
        <div className={'front' + (isCensored && !isEditing ? ' filter' : '')}>
          <div className="message-body">
            <div className="text">{linkify(message.text)}</div>
            <a
              className="pencil message-body-link"
              onClick={beginEditing}
              aria-label="Edit message"
            >
              <i className="fa fa-pencil"></i>
            </a>
          </div>
          <div className="votes">
            {canUnvoteMessage(boardId, message.id) && (
              <a
                className="message-body-link"
                onClick={() => onUnvote(message)}
                aria-label="Unvote"
              >
                <i className="fa fa-times"></i>
              </a>
            )}
            <ul className="message-votes">
              {Array.from({ length: ownVotes }, (_, index) => (
                <li key={index}></li>
              ))}
            </ul>
            <strong className="vote-area">
              <a
                className={
                  (ableToVote ? '' : 'disabled ') + 'message-body-link'
                }
                onClick={() => onVote(message)}
                aria-label="Vote"
              >
                <i className="fa fa-thumbs-o-up"></i>
              </a>
              <span
                className={
                  board.hide_vote ? 'hide-vote-count' : 'show-vote-count'
                }
              >
                {' '}
                {message.votes}
              </span>
            </strong>
          </div>
        </div>
        <div className="back">
          <div className="message-body">
            <div className="editing">
              <textarea
                value={draft}
                autoFocus={isEditing}
                onChange={(event) => updateDraft(event.target.value)}
                aria-label="Message text entry"
              ></textarea>
              <button onClick={finishEditing}>DONE</button>
              <a
                className="delete-link message-body-link"
                onClick={() => onDelete(message.id)}
                aria-label="Delete message"
              >
                <i className="fa fa-trash"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="placeholder">{isEditing ? draft : message.text}</div>
      </div>
    </li>
  );
}
