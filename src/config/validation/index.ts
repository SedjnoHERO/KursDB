export const patterns = {
    phone: /^\+375\s?\(?(25|29|33|44)\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/,
    passportSeries: /^[A-Z]{2}$/,
    passportNumber: /^[0-9]{7}$/,
    name: /^[А-Яа-яЁё\s-]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };
  
  export const formatPhone = (value: string): string => {
    // Удаляем все нецифровые символы
    let numbers = value.replace(/\D/g, '');
  
    // Если номер начинается с 375, убираем его
    if (numbers.startsWith('375')) {
      numbers = numbers.slice(3);
    }
  
    // Если номер начинается с 8 или 7, убираем
    if (numbers.startsWith('8') || numbers.startsWith('7')) {
      numbers = numbers.slice(1);
    }
  
    // Ограничиваем длину до 12 цифр
    numbers = numbers.slice(0, 12);
  
    // Форматируем номер
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `+375 (${numbers}`;
    if (numbers.length <= 5) return `+375 (${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `+375 (${numbers.slice(0, 2)}) ${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    if (numbers.length <= 9) return `+375 (${numbers.slice(0, 2)}) ${numbers.slice(2, 5)}-${numbers.slice(5, 7)}-${numbers.slice(7)}`;
    return `+375 (${numbers.slice(0, 2)}) ${numbers.slice(2, 5)}-${numbers.slice(5, 7)}-${numbers.slice(7, 9)}`;
  };
  