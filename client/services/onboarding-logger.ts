// services/onboarding-logger.ts
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'onboarding.log');

// Функция для записи логов онбординга
export function logOnboarding(level: 'info' | 'error' | 'success' | 'debug', message: string, data?: any) {
  const timestamp = new Date().toLocaleString('ru-RU');
  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  if (data) {
    if (data instanceof Error) {
      logEntry += `  ↳ Error: ${data.message}\n`;
      if (data.stack) {
        logEntry += `  ↳ Stack: ${data.stack.split('\n')[0]}\n`;
      }
    } else if (typeof data === 'object') {
      try {
        // Безопасный лог - не показываем base64 фото
        const safeData = { ...data };
        if (safeData.childPhotos) {
          safeData.childPhotos = `[${safeData.childPhotos.length} photos]`;
        }
        if (safeData.photos) {
          safeData.photos = `[${safeData.photos.length} photos]`;
        }
        logEntry += `  ↳ ${JSON.stringify(safeData, null, 2)}\n`;
      } catch {
        logEntry += `  ↳ [Object]\n`;
      }
    } else {
      logEntry += `  ↳ ${data}\n`;
    }
  }
  
  // Синхронная запись для надежности
  try {
    fs.appendFileSync(logFile, logEntry, 'utf8');
  } catch (err) {
    console.error('❌ Не удалось записать в лог онбординга:', err);
  }
  
  // Также пишем в консоль для отладки
  const colors = {
    info: '\x1b[36m',    // cyan
    error: '\x1b[31m',   // red
    success: '\x1b[32m', // green
    debug: '\x1b[90m'    // gray
  };
  
  console.log(colors[level] + `[ONBOARDING ${level.toUpperCase()}] ${message}` + '\x1b[0m');
}

// Инициализация лог-файла
export function initOnboardingLog() {
  try {
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, `=== ONBOARDING LOG STARTED AT ${new Date().toISOString()} ===\n\n`);
    } else {
      fs.appendFileSync(logFile, `\n=== NEW SESSION AT ${new Date().toLocaleString('ru-RU')} ===\n\n`);
    }
    logOnboarding('info', 'Лог онбординга инициализирован', { file: logFile });
  } catch (err) {
    console.error('❌ Не удалось создать лог онбординга:', err);
  }
}