import { useState } from 'react';
import { Modal } from './Modal';

interface NewColumnModalProps {
  onAdd: (name: string) => void;
  onClose: () => void;
}

export function NewColumnModal({ onAdd, onClose }: NewColumnModalProps) {
  const [name, setName] = useState('');

  const add = () => {
    if (name !== '') {
      onAdd(name);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h1>New column</h1>
      <input
        type="text"
        value={name}
        autoFocus
        aria-label="New column name"
        onChange={(event) => setName(event.target.value)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            add();
          }
        }}
      />
      <button onClick={add}>Add</button>
    </Modal>
  );
}
