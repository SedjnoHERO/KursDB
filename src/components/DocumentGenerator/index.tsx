import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as QRCode from 'qrcode';

interface DocumentGeneratorProps {
  type: 'ticket' | 'receipt';
  data: any;
}

// Unicode символы для иконок
const PLANE_ICON = '✈️';
const ARROW_ICON = '→';

// Функция для декодирования Base64 в Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Функция для рисования рамки
const drawBorder = (page: any, margin: number = 10) => {
  const { width, height } = page.getSize();
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - 2 * margin,
    height: height - 2 * margin,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });
};

// Функция для рисования горизонтальной линии
const drawHorizontalLine = (page: any, y: number, margin: number = 10) => {
  const { width } = page.getSize();
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
};

// Функция для генерации QR-кода
const generateQRCode = async (text: string): Promise<Uint8Array> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    const base64Data = qrDataUrl.replace('data:image/png;base64,', '');
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error('Ошибка при генерации QR-кода:', error);
    throw error;
  }
};

// Функция для рисования SVG в PDF
const drawSVG = (
  page: any,
  svg: string,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  try {
    const svgDoc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const path = svgDoc.querySelector('path')?.getAttribute('d');

    if (path) {
      page.drawSvgPath(path, {
        x,
        y,
        width,
        height,
        color: rgb(0, 0, 0),
      });
    }
  } catch (error) {
    console.error('Ошибка при отрисовке SVG:', error);
  }
};

export const generateDocument = async (
  type: 'ticket' | 'receipt',
  data: any,
) => {
  try {
    console.log('Начало создания PDF документа:', { type, data });

    if (!data.FlightNumber) {
      throw new Error('Отсутствует номер рейса (FlightNumber)');
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontUrl = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf';
    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    // Устанавливаем разные размеры для билета и чека
    const pageSize: [number, number] =
      type === 'ticket' ? [600, 280] : [300, 500];

    const page = pdfDoc.addPage(pageSize);
    page.setFont(customFont);

    if (type === 'ticket') {
      // Рисуем рамку
      drawBorder(page);

      // Заголовок с подложкой
      const headerHeight = 40;
      page.drawRectangle({
        x: 10,
        y: page.getHeight() - headerHeight - 10,
        width: page.getWidth() - 20,
        height: headerHeight,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Логотип авиакомпании с иконкой
      page.drawText(`AeroControl`, {
        x: 20,
        y: page.getHeight() - 35,
        size: 16,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      page.drawText('АВИАБИЛЕТ', {
        x: page.getWidth() - 150,
        y: page.getHeight() - 35,
        size: 20,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      // Линия под заголовком
      drawHorizontalLine(page, page.getHeight() - 50);

      // Основная информация в две колонки
      const leftColumnX = 20;
      const rightColumnX = page.getWidth() / 2 + 20;
      let leftYPos = page.getHeight() - 80;
      let rightYPos = page.getHeight() - 80;

      // Левая колонка с маршрутом
      const leftColumnInfo = [
        'ИНФОРМАЦИЯ О РЕЙСЕ',
        `Номер рейса: ${data.FlightNumber}`,
        `Дата вылета: ${new Date(data.DepartureTime).toLocaleString('ru-RU')}`,
        '',
        'МАРШРУТ',
        `${data.from} - ${data.to}`,
      ];

      // Правая колонка
      const rightColumnInfo = [
        'ИНФОРМАЦИЯ О ПАССАЖИРЕ',
        `Пассажир: ${(() => {
          if (data.User?.FirstName && data.User?.LastName) {
            return `${data.User.FirstName} ${data.User.LastName}`;
          }
          if (data.firstName && data.lastName) {
            return `${data.firstName} ${data.lastName}`;
          }
          if (data.User?.Email) {
            return data.User.Email;
          }
          return 'Не указан';
        })()}`,
        `Место: ${data.SeatNumber || 'Не указано'}`,
        '',
        `Статус: ${data.Status || 'Оплачен'}`,
      ];

      // Отрисовка левой колонки
      leftColumnInfo.forEach((line, index) => {
        const isBold = index === 0 || index === 4;
        page.drawText(line, {
          x: leftColumnX,
          y: leftYPos,
          size: isBold ? 12 : 10,
          font: customFont,
          color: rgb(0, 0, 0),
        });
        leftYPos -= isBold ? 20 : 15;
      });

      // Отрисовка правой колонки
      rightColumnInfo.forEach((line, index) => {
        const isBold = index === 0 || index === 4;
        page.drawText(line, {
          x: rightColumnX,
          y: rightYPos,
          size: isBold ? 12 : 10,
          font: customFont,
          color: rgb(0, 0, 0),
        });
        rightYPos -= isBold ? 20 : 15;
      });

      // QR-код для билета
      const qrSize = 50;
      const ticketUrl = `https://kursdbapp.netlify.app/${data.id || data.TicketID}`;

      try {
        // Генерируем QR-код
        const qrCodeImage = await generateQRCode(ticketUrl);

        // Встраиваем QR-код в PDF
        const qrImage = await pdfDoc.embedPng(qrCodeImage);
        const qrDims = qrImage.scale(qrSize / qrImage.width);

        page.drawImage(qrImage, {
          x: page.getWidth() - qrSize - 20,
          y: 20,
          width: qrDims.width,
          height: qrDims.height,
        });
      } catch (error) {
        console.error('Ошибка при добавлении QR-кода:', error);
        // Если не удалось сгенерировать QR-код, рисуем прямоугольник
        page.drawRectangle({
          x: page.getWidth() - qrSize - 20,
          y: 20,
          width: qrSize,
          height: qrSize,
          color: rgb(0, 0, 0),
        });
      }

      // Подпись под QR-кодом
      const qrText = 'Сканируйте для проверки';
      const qrTextWidth = customFont.widthOfTextAtSize(qrText, 8);
      page.drawText(qrText, {
        x: page.getWidth() - qrSize - 20 + (qrSize - qrTextWidth) / 2,
        y: 75,
        size: 8,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      // Нижний колонтитул
      drawHorizontalLine(page, 100);

      page.drawText(
        'Документ сформирован автоматически и действителен при предъявлении паспорта',
        {
          x: leftColumnX,
          y: 20,
          size: 8,
          font: customFont,
          color: rgb(0, 0, 0),
        },
      );

      page.drawText(
        `Дата формирования: ${new Date().toLocaleString('ru-RU')}`,
        {
          x: leftColumnX,
          y: 35,
          size: 8,
          font: customFont,
          color: rgb(0, 0, 0),
        },
      );
    } else {
      // Рисуем рамку для чека
      drawBorder(page);

      const centerX = page.getWidth() / 2;

      // Заголовок чека с подложкой
      page.drawRectangle({
        x: 10,
        y: page.getHeight() - 50,
        width: page.getWidth() - 20,
        height: 40,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Заголовок чека
      const title = 'ЧЕК ОБ ОПЛАТЕ';
      const titleWidth = customFont.widthOfTextAtSize(title, 14);
      page.drawText(title, {
        x: centerX - titleWidth / 2,
        y: page.getHeight() - 35,
        size: 14,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      // Линия под заголовком
      drawHorizontalLine(page, page.getHeight() - 50);

      const receiptInfo = [
        { text: 'ИНФОРМАЦИЯ ОБ ОПЛАТЕ', isBold: true },
        { text: `Номер билета: ${data.TicketID}`, isBold: false },
        {
          text: `Дата покупки: ${new Date(data.PurchaseDate).toLocaleString('ru-RU')}`,
          isBold: false,
        },
        { text: '', isBold: false },
        { text: 'ДЕТАЛИ ПЛАТЕЖА', isBold: true },
        { text: `Стоимость билета: ${data.Price} BYN`, isBold: false },
        {
          text: `НДС (20%): ${(data.Price * 0.2).toFixed(2)} BYN`,
          isBold: false,
        },
        { text: `ИТОГО: ${data.Price} BYN`, isBold: true },
        { text: '', isBold: false },
        { text: 'ИНФОРМАЦИЯ О РЕЙСЕ', isBold: true },
        { text: `Номер рейса: ${data.FlightNumber}`, isBold: false },
        { text: `Маршрут: ${data.from} ➔ ${data.to}`, isBold: false },
      ];

      let yPos = page.getHeight() - 80;
      receiptInfo.forEach(({ text, isBold }) => {
        const textWidth = customFont.widthOfTextAtSize(text, isBold ? 12 : 10);
        page.drawText(text, {
          x: centerX - textWidth / 2,
          y: yPos,
          size: isBold ? 12 : 10,
          font: customFont,
          color: rgb(0, 0, 0),
        });
        yPos -= isBold ? 20 : 15;
      });

      // QR-код для чека
      const qrSize = 40;
      const receiptUrl = `https://kursdbapp.netlify.app/${data.id || data.TicketID}`;

      try {
        // Генерируем QR-код
        const qrCodeImage = await generateQRCode(receiptUrl);

        // Встраиваем QR-код в PDF
        const qrImage = await pdfDoc.embedPng(qrCodeImage);
        const qrDims = qrImage.scale(qrSize / qrImage.width);

        page.drawImage(qrImage, {
          x: centerX - qrDims.width / 2,
          y: 100,
          width: qrDims.width,
          height: qrDims.height,
        });
      } catch (error) {
        console.error('Ошибка при добавлении QR-кода:', error);
        // Если не удалось сгенерировать QR-код, рисуем прямоугольник
        page.drawRectangle({
          x: centerX - qrSize / 2,
          y: 100,
          width: qrSize,
          height: qrSize,
          color: rgb(0, 0, 0),
        });
      }

      // Линия перед нижним колонтитулом
      drawHorizontalLine(page, 90);

      // Нижний колонтитул
      const footerText = 'Сохраните этот документ для подтверждения оплаты';
      const footerWidth = customFont.widthOfTextAtSize(footerText, 8);
      page.drawText(footerText, {
        x: centerX - footerWidth / 2,
        y: 70,
        size: 8,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      const dateText = `Дата формирования: ${new Date().toLocaleString('ru-RU')}`;
      const dateWidth = customFont.widthOfTextAtSize(dateText, 8);
      page.drawText(dateText, {
        x: centerX - dateWidth / 2,
        y: 55,
        size: 8,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    }

    console.log('PDF документ успешно создан');
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    throw error;
  }
};

export const downloadDocument = async (
  type: 'ticket' | 'receipt',
  data: any,
) => {
  try {
    console.log('Начало генерации документа. Тип:', type);
    console.log('Данные для документа:', data);

    const pdfBytes = await generateDocument(type, data);
    console.log('PDF успешно сгенерирован');

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${data.id || data.TicketID}.pdf`;

    console.log('Скачивание документа...');
    link.click();

    window.URL.revokeObjectURL(url);
    console.log('Документ успешно скачан');
  } catch (error) {
    console.error('Ошибка в downloadDocument:', error);
    throw error;
  }
};
