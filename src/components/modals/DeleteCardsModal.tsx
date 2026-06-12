import { ConfirmModal } from './ConfirmModal';

interface DeleteCardsModalProps {
  onDelete: () => void;
  onClose: () => void;
}

export function DeleteCardsModal({
  onDelete,
  onClose,
}: DeleteCardsModalProps) {
  return (
    <ConfirmModal onConfirm={onDelete} onClose={onClose} danger>
      <p className="header">Danger Zone</p>
      <p>Are you sure you want to delete all cards?</p>
      <p>
        Once you delete all cards, there is no going back. Please be certain.
      </p>
    </ConfirmModal>
  );
}
