import { Screen, Typography } from '@components';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss';

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Screen>
      <div className={styles.errorContainer}>
        <div className={styles.content}>
          <Typography className={styles.errorCode} text="404" />

          <Typography className={styles.title} text="Страница не найдена" />

          <Typography
            className={styles.description}
            text="Возможно, страница была удалена или её никогда не существовало"
          />

          <button className={styles.backButton} onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </div>
    </Screen>
  );
};
