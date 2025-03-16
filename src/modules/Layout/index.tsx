import { FC, ReactNode } from 'react';
import { Footer } from '@components';
import { Header, Screen } from '@components';
import { EntityType } from '@api';

import styles from './style.module.scss';

interface LayoutProps {
  children: ReactNode;
  headerType?: 'default' | 'admin' | 'minimal';
  footerType?: 'default' | 'thin';
  activeType?: EntityType;
  onTypeChange?: (type: EntityType) => void;
}

export const Layout: FC<LayoutProps> = ({
  children,
  headerType = 'minimal',
  footerType = 'thin',
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
      <Screen>{children}</Screen>
      <Footer type={footerType} />
    </div>
  );
};
