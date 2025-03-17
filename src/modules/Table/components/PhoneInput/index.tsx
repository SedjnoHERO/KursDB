import React, { ChangeEvent, KeyboardEvent } from 'react';
import styles from './style.module.scss';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Введите номер телефона',
  className = '',
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && value === '+375') {
      e.preventDefault();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (input.length < 4) {
      onChange('+375');
      return;
    }

    const digits = input.replace(/\D/g, '').replace(/^375/, '').slice(0, 9);

    let formattedPhone = '+375';

    if (digits) {
      if (digits.length > 0) {
        formattedPhone += ' (' + digits.slice(0, 2);
      }
      if (digits.length > 2) {
        formattedPhone += ') ' + digits.slice(2, 5);
      }
      if (digits.length > 5) {
        formattedPhone += '-' + digits.slice(5, 7);
      }
      if (digits.length > 7) {
        formattedPhone += '-' + digits.slice(7);
      }
    }

    onChange(formattedPhone);
  };

  return (
    <input
      type="tel"
      value={value || '+375'}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`${styles.phoneInput} ${className}`}
    />
  );
};
