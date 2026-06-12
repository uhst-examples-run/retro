import { ConfirmModal } from './ConfirmModal';

interface MergeCardsModalProps {
  onMerge: () => void;
  onClose: () => void;
}

export function MergeCardsModal({ onMerge, onClose }: MergeCardsModalProps) {
  return (
    <ConfirmModal onConfirm={onMerge} onClose={onClose} confirmLabel="Merge">
      <h1>Merge cards</h1>
      <p>Are you sure you want to merge these two cards?</p>
    </ConfirmModal>
  );
}
