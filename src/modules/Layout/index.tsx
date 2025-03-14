import { FC, ReactNode } from 'react';
import { Footer } from '@components';
import { Header } from '@modules';
import { EntityType } from '@api';

import styles from './style.module.scss';

interface LayoutProps {
  children: ReactNode;
  headerType?: 'default' | 'admin';
  footerType?: 'default' | 'thin';
  activeType?: EntityType;
  onTypeChange?: (type: EntityType) => void;
}

export const Layout: FC<LayoutProps> = ({
  children,
  headerType = 'default',
  footerType = 'default',
  activeType,
  onTypeChange,
}) => {
  return (
    <div className={styles.layout}>
      <Header
        type={headerType}
        activeType={activeType}
        onTypeChange={onTypeChange}
      />
      <main className={styles.main}>{children}</main>
      <Footer type={footerType} />
    </div>
  );
};
