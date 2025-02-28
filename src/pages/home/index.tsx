import { useState } from 'react';

import { Button, TableComponent } from '@components';

import { toast, Toaster } from 'sonner';
import styles from './style.module.scss';

export const Home = () => {
  const message = () => {
    toast.loading('Загрузка данных, ожидайте');
  };

  const [type, setType] = useState<
    'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER'
  >('PASSENGER');

  return (
    <div className={styles.main}>
      <Toaster position="bottom-right" />
      <Button label="Нажать" size="large" onClick={message} />
      <div className={styles.buttonContainer}>
        <Button label="Пассажиры" onClick={() => setType('PASSENGER')} />
        <Button label="Самолёты" onClick={() => setType('AIRPLANE')} />
        <Button label="Авиакомпании" onClick={() => setType('AIRLINE')} />
        <Button label="Билеты" onClick={() => setType('TICKET')} />
        <Button label="Полёты" onClick={() => setType('FLIGHT')} />
        <Button label="Аэропорты" onClick={() => setType('AIRPORT')} />
      </div>
      <TableComponent type={type} />
    </div>
  );
};
