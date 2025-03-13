import { useState } from 'react';
import { Header } from '@components';
import { EntityType } from '@api';
import styles from './style.module.scss';
import { TableComponent } from '@modules';
import { Toaster } from 'sonner';

export const AdminPage = () => {
  const [type, setType] = useState<EntityType>('PASSENGER');

  return (
    <div className={styles.container}>
      <Toaster theme="dark" />
      <Header activeType={type} onTypeChange={setType} />
      <main className={styles.content}>
        <TableComponent type={type} />
      </main>
    </div>
  );
};
