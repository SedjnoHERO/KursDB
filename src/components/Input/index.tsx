import { ChangeEvent, ReactNode } from 'react';
import styles from './style.module.scss';

export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'select'
  | 'date'
  | 'datetime-local'
  | 'button';

interface Option {
  value: string;
  label: string;
}

interface InputProps {
  type: InputType;
  name: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  options?: Option[];
  icon?: ReactNode;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  onClick?: () => void;
}

const getClassName = (
  ...classes: (string | undefined | boolean | { [key: string]: boolean })[]
) => {
  return classes
    .filter(Boolean)
    .map(c =>
      typeof c === 'object'
        ? Object.entries(c)
            .filter(([_, v]) => v)
            .map(([k]) => k)
        : c,
    )
    .flat()
    .join(' ');
};

export const Input = ({
  type,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  options,
  icon,
  className,
  inputClassName,
  disabled,
  min,
  max,
  onClick,
}: InputProps) => {
  const renderInput = () => {
    const commonProps = {
      name,
      value,
      required,
      disabled,
      onChange,
      className: getClassName(styles.input, inputClassName, {
        [styles.withIcon]: icon,
        [styles.error]: error,
      }),
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'button':
        return (
          <button
            type="button"
            className={getClassName(styles.button, inputClassName)}
            onClick={onClick}
            name={name}
            value={value}
            disabled={disabled}
          >
            {value || label}
          </button>
        );

      case 'date':
      case 'datetime-local':
        return (
          <input
            type={type}
            {...commonProps}
            min={min}
            max={max}
            placeholder={placeholder}
          />
        );

      default:
        return <input type={type} {...commonProps} placeholder={placeholder} />;
    }
  };

  return (
    <div className={getClassName(styles.inputContainer, className)}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {renderInput()}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
