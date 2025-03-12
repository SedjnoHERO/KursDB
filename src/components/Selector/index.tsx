import styles from './style.module.scss';

interface SelectorProps {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export const Selector: React.FC<SelectorProps> = ({ options, onChange }) => {
  return (
    <div className={styles.selector}>
      <select
        className={styles.dropdown}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
