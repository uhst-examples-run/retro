import { ConfirmModal } from './ConfirmModal';

interface DeleteBoardModalProps {
  onDelete: () => void;
  onClose: () => void;
}

export function DeleteBoardModal({
  onDelete,
  onClose,
}: DeleteBoardModalProps) {
  return (
    <ConfirmModal onConfirm={onDelete} onClose={onClose} danger>
      <p className="header">Danger Zone</p>
      <p>Are you sure you want to delete the board?</p>
      <p>
        Once you delete the board, there is no going back. Please be certain.
      </p>
    </ConfirmModal>
  );
}
