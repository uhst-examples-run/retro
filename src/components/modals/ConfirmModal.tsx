import type { ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  danger?: boolean;
  children: ReactNode;
}

export function ConfirmModal({
  onConfirm,
  onClose,
  confirmLabel = 'Delete',
  danger,
  children,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onClose} danger={danger}>
      {children}
      <button className="delete-button" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <a onClick={onClose}>Cancel</a>
    </Modal>
  );
}
