import React from 'react';
import { Typography } from '@components';
import styles from './style.module.scss';

interface IButtonProps {
  label: string;
  leftIcon?: React.ReactElement;
  variant?: 'primary' | 'outline';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  label,
  leftIcon,
  variant = 'primary',
  onClick,
  className,
  disabled = false,
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <Typography text={label} className="buttonText" />
    </button>
  );
};
