import styles from './style.module.scss';

interface ISkeletonProps {
  type?: 'text' | 'title' | 'button' | 'flight';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<ISkeletonProps> = ({
  type = 'text',
  style,
}) => {
  return <div className={`${styles.skeleton} ${styles[type]}`} style={style} />;
};
