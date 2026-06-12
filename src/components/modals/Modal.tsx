import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  danger?: boolean;
  children: ReactNode;
}

export function Modal({ onClose, danger, children }: ModalProps) {
  return (
    <div className={'modal' + (danger ? ' danger' : '')}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <i className="fa fa-times"></i>
        </button>
        {children}
      </div>
    </div>
  );
}
