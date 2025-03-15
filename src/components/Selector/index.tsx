import styles from './style.module.scss';

interface Option {
  value: string;
  label: string;
}

interface SelectorProps {
  options: Option[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  className?: string;
  type?: string;
}

export const Selector = ({
  options,
  onChange,
  value,
  placeholder,
  className,
  type,
}: SelectorProps) => {
  if (type === 'date') {
    return (
      <div className={styles.selector}>
        <input
          type="date"
          className={`${styles.dropdown} ${className || ''}`}
          onChange={e => onChange(e.target.value)}
          value={value}
          placeholder={placeholder}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
    );
  }

  return (
    <div className={styles.selector}>
      <select
        className={`${styles.dropdown} ${className || ''} ${!value ? styles.placeholder : ''}`}
        onChange={e => onChange(e.target.value)}
        value={value || ''}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
