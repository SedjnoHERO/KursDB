import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    console.log('Service Worker зарегистрирован:', swUrl);
    if (r) {
      console.log('Service Worker активен');
      r.update();
    }
  },
  onOfflineReady() {
    console.log('Приложение готово к работе офлайн');
  },
}); 