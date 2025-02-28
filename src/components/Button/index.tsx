import React from 'react';
import { Typography } from '../Typography';
import styles from './style.module.scss';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonColor = 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
type ButtonType = 'solid' | 'outline' | 'ghost';

interface IButtonProps {
  onClick: () => void;
  label: string;
  size?: ButtonSize;
  color?: ButtonColor;
  buttonStyle?: string;
  textStyles?: string;
  type?: ButtonType;
  disabled?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  onClick,
  label = 'Button',
  size = 'medium',
  color = 'primary',
  type = 'solid',
  disabled = false,
  buttonStyle,
  textStyles,
}) => {
  const buttonClass = [
    styles.defaultButton,
    size && styles[size],
    styles[color],
    styles[type],
    buttonStyle,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button onClick={onClick} className={buttonClass} disabled={disabled}>
      <Typography text={label} className={textStyles} />
    </button>
  );
};
