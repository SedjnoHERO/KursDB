import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegistered(swRegistration) {
    if (swRegistration) {
      setInterval(() => {
        swRegistration.update();
      }, 60 * 1000); // Проверка обновлений каждую минуту
    }
  },
  onRegisterError(error) {
    // Handle registration error
  }
}); 