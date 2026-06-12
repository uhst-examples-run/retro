import { ConfirmModal } from './ConfirmModal';

interface DeleteColumnModalProps {
  onDelete: () => void;
  onClose: () => void;
}

export function DeleteColumnModal({
  onDelete,
  onClose,
}: DeleteColumnModalProps) {
  return (
    <ConfirmModal onConfirm={onDelete} onClose={onClose}>
      <h1>Delete column</h1>
      <p>Are you sure you want to delete this column?</p>
    </ConfirmModal>
  );
}
