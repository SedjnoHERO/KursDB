import React from 'react';
import { Button } from '@components';
import styles from './style.module.scss';

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText,
  size = 'md',
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles[size]}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.content}>{children}</div>
        {onConfirm && (
          <div className={styles.footer}>
            <Button label={confirmText || 'Подтвердить'} onClick={onConfirm} />
            <Button variant="outline" label="Отмена" onClick={onClose} />
          </div>
        )}
      </div>
    </div>
  );
};
