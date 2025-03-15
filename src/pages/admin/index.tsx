import { useState } from 'react';
import { Layout } from '@modules';
import { EntityType } from '@api';
import styles from './style.module.scss';
import { TableComponent } from '@modules';
import { Toaster } from 'sonner';

export const AdminPage = () => {
  const [type, setType] = useState<EntityType>('PASSENGER');

  return (
    <Layout
      headerType="admin"
      activeType={type}
      onTypeChange={setType}
      footerType="thin"
    >
      <div className={styles.container}>
        <Toaster theme="dark" />
        <main className={styles.content}>
          <TableComponent type={type} />
        </main>
      </div>
    </Layout>
  );
};
