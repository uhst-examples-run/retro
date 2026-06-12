import { Modal } from './Modal';

interface PrivateWritingModalProps {
  isPrivate: boolean;
  onToggle: (isPrivate: boolean) => void;
  onClose: () => void;
}

export function PrivateWritingModal({
  isPrivate,
  onToggle,
  onClose,
}: PrivateWritingModalProps) {
  return (
    <Modal onClose={onClose}>
      <h1>Private writing</h1>
      <div className="labeled-checkbox">
        <input
          className="toggle-checkbox"
          id="toggle-private"
          type="checkbox"
          checked={isPrivate}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <label htmlFor="toggle-private">
          Private writing during card editing
        </label>
      </div>
    </Modal>
  );
}
