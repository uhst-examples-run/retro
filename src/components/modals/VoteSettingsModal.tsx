import { Modal } from './Modal';

interface VoteSettingsModalProps {
  maxVotes: number;
  hideVote: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleHideVote: () => void;
  onClose: () => void;
}

export function VoteSettingsModal({
  maxVotes,
  hideVote,
  onIncrement,
  onDecrement,
  onToggleHideVote,
  onClose,
}: VoteSettingsModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="vote-settings">
        <h1>Vote Settings</h1>
        <p>Define max number of votes per participant</p>
        <p>
          <span className="maximum-votes">
            Max votes: <strong>{maxVotes}</strong>
          </span>
          <span className="null-blank-space">&nbsp;</span>
          <span>
            <button className="increment-button" onClick={onIncrement}>
              <i className="fa fa-plus fa-md increment-button" aria-hidden="true"></i>
            </button>
          </span>
          <span>
            <button className="increment-button" onClick={onDecrement}>
              <i className="fa fa-minus fa-md decrement-button" aria-hidden="true"></i>
            </button>
          </span>
        </p>
        <button className="hide-vote" onClick={onToggleHideVote}>
          {hideVote ? <span>Show vote counts</span> : <span>Hide vote counts</span>}
        </button>
      </div>
    </Modal>
  );
}
