import { ReactNode } from 'react';
import { Toaster, ToasterProps } from 'sonner';

import styles from './style.module.scss';

const toasterShortcuts: Record<string, ToasterProps['position']> = {
  top: 'top-center',
  bottom: 'bottom-right',
};

interface IScreenProps {
  children: ReactNode;
  toasterPosition?: keyof typeof toasterShortcuts;
  className?: string;
}

export const Screen: React.FC<IScreenProps> = ({
  children,
  toasterPosition = 'top-center',
  className,
}) => {
  return (
    <div className={className ? styles[className] : styles.main}>
      <Toaster position={toasterShortcuts[toasterPosition]} />
      {children}
    </div>
  );
};
