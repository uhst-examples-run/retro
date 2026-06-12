import { ConfirmModal } from './ConfirmModal';

interface DeleteCardModalProps {
  onDelete: () => void;
  onClose: () => void;
}

export function DeleteCardModal({ onDelete, onClose }: DeleteCardModalProps) {
  return (
    <ConfirmModal onConfirm={onDelete} onClose={onClose}>
      <h1>Delete note</h1>
      <p>Are you sure you want to delete this note?</p>
    </ConfirmModal>
  );
}
