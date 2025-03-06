import React from 'react';
import { Button } from '@components';
import styles from './style.module.scss';

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <Button
            variant="outline"
            label="×"
            onClick={onClose}
            className={styles.closeButton}
          />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
