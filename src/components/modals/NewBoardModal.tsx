import { useState } from 'react';
import { Modal } from './Modal';

interface NewBoardModalProps {
  onCreate: (
    name: string,
    maxVotes: number,
    textEditingIsPrivate: boolean
  ) => void;
  onClose: () => void;
}

export function NewBoardModal({ onCreate, onClose }: NewBoardModalProps) {
  const [name, setName] = useState('');
  const [maxVotes, setMaxVotes] = useState(6);
  const [isPrivate, setIsPrivate] = useState(true);

  const isNameInvalid = name === '';
  const isMaxVotesValid = Number.isInteger(maxVotes);

  const create = () => {
    if (!isNameInvalid && isMaxVotesValid) {
      onCreate(name, maxVotes, isPrivate);
    }
  };

  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      create();
    }
  };

  return (
    <Modal onClose={onClose}>
      <h1>New board</h1>
      <label htmlFor="newBoardName">Board name</label>
      <input
        id="newBoardName"
        type="text"
        value={name}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyUp={submitOnEnter}
      />
      <label htmlFor="maxUserVotes">
        Max votes per user <small>(whole board)</small>
      </label>
      <input
        id="maxUserVotes"
        type="number"
        value={Number.isNaN(maxVotes) ? '' : maxVotes}
        onChange={(event) => setMaxVotes(event.target.valueAsNumber)}
        onKeyUp={submitOnEnter}
      />
      <div className="labeled-checkbox">
        <input
          id="newBoardPrivate"
          className="toggle-checkbox"
          type="checkbox"
          checked={isPrivate}
          onChange={(event) => setIsPrivate(event.target.checked)}
        />
        <label htmlFor="newBoardPrivate">
          Private writing during card editing
        </label>
      </div>
      <button disabled={isNameInvalid || !isMaxVotesValid} onClick={create}>
        Create
      </button>
    </Modal>
  );
}
