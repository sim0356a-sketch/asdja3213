import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import mysql from 'mysql2/promise';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import multer from 'multer';
import * as z from "zod";
import {zodResponseFormat} from "openai/helpers/zod";

// =========================================================
// ЛОГГЕР
// =========================================================

const logFile = path.join(process.cwd(), 'server.log');

function logToFile(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  if (data) {
    if (data instanceof Error) {
      logEntry += `  ↳ ${data.message}\n`;
      if (data.stack) {
        const stackLines = data.stack.split('\n').slice(0, 3);
        logEntry += `  ↳ Stack: ${stackLines.join(' | ')}\n`;
      }
    } else if (typeof data === 'object') {
      try {
        const jsonStr = JSON.stringify(data);
        if (jsonStr.length > 1000) {
          logEntry += `  ↳ ${jsonStr.substring(0, 1000)}... [TRUNCATED]\n`;
        } else {
          logEntry += `  ↳ ${jsonStr}\n`;
        }
      } catch {
        logEntry += `  ↳ [Circular or unserializable object]\n`;
      }
    } else {
      logEntry += `  ↳ ${data}\n`;
    }
  }
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Не удалось записать в лог-файл:', err);
    }
  });
  
  const consoleColors = {
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    success: '\x1b[32m',
    debug: '\x1b[35m',
  };
  
  const reset = '\x1b[0m';
  const color = consoleColors[level] || '\x1b[37m';
  
  if (level === 'error') {
    console.error(color + `[${level.toUpperCase()}] ${message}` + reset, data || '');
  } else if (level === 'warn') {
    console.warn(color + `[${level.toUpperCase()}] ${message}` + reset, data || '');
  } else {
    console.log(color + `[${level.toUpperCase()}] ${message}` + reset, data || '');
  }
}

// =========================================================
// ИНИЦИАЛИЗАЦИЯ ДЛЯ VPS
// =========================================================

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// 🔴 КРИТИЧЕСКОЕ: Настройки для VPS
const PORT = process.env.PORT || 8080;
const DOMAIN = 'myskaz.ru';
const SITE_URL = `https://${DOMAIN}`;
const API_URL = `${SITE_URL}/api`;

console.log('\n' + '='.repeat(50));
console.log('🚀 НАСТРОЙКА ДЛЯ VPS РАЗМЕЩЕНИЯ');
console.log('='.repeat(50));
console.log(`🌐 Домен: ${DOMAIN}`);
console.log(`🔗 URL: ${SITE_URL}`);
console.log(`🔗 API URL: ${API_URL}`);
console.log(`📊 Внутренний порт: ${PORT}`);
console.log('='.repeat(50));

// =========================================================
// КОНФИГУРАЦИЯ ПРОКСИ (ТОЛЬКО ДЛЯ OPENAI)
// =========================================================

let appSettings = {
  openai_key: process.env.OPENAI_API_KEY || '',
  proxy: process.env.PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || ''
};

let openaiClient = null;

// =========================================================
// ПРОСТОЙ ТЕСТ ПРОКСИ (TCP + HTTP)
// =========================================================

async function testProxyTcpOnly() {
  const proxyUrl = appSettings.proxy;
  
  if (!proxyUrl) {
    return { success: false, message: 'Прокси не настроен' };
  }
  
  console.log('🔍 Проверяем TCP соединение с прокси...');
  
  try {
    // Парсим URL
    let urlStr = proxyUrl;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'http://' + urlStr;
    }
    
    const url = new URL(urlStr);
    const host = url.hostname;
    const port = url.port || (url.protocol === 'https:' ? 443 : 80);
    
    console.log(`🔍 Проверяю ${host}:${port}...`);
    
    const net = await import('net');
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        socket.destroy();
        console.log(`✅ TCP соединение установлено: ${host}:${port}`);
        resolve({ 
          success: true, 
          host, 
          port,
          message: 'Прокси доступен по TCP' 
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        console.log(`⏱️  Таймаут TCP: ${host}:${port}`);
        resolve({ 
          success: false, 
          host, 
          port,
          message: 'Таймаут TCP соединения' 
        });
      });
      
      socket.on('error', (error) => {
        console.log(`❌ TCP ошибка: ${error.message}`);
        resolve({ 
          success: false, 
          host, 
          port,
          message: `TCP ошибка: ${error.message}` 
        });
      });
      
      socket.connect(port, host);
    });
    
  } catch (error) {
    console.error('❌ Ошибка TCP теста:', error.message);
    return { 
      success: false, 
      message: `Ошибка: ${error.message}` 
    };
  }
}

async function testProxyHttp() {
  const proxyUrl = appSettings.proxy;
  
  if (!proxyUrl) {
    console.log('⚠️  Прокси не настроен');
    return { success: false, message: 'Прокси не настроен' };
  }
  
  console.log('🔍 Тестируем HTTP через прокси...');
  
  try {
    // Используем переменные окружения для прокси (как в curl)
    const originalHttpProxy = process.env.HTTP_PROXY;
    const originalHttpsProxy = process.env.HTTPS_PROXY;
    
    process.env.HTTP_PROXY = proxyUrl;
    process.env.HTTPS_PROXY = proxyUrl;
    
    console.log(`🔗 Использую прокси через env vars: ${proxyUrl.replace(/\/\/([^:@]+):([^:@]+)@/, '//****:****@')}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Восстанавливаем оригинальные переменные окружения
    if (originalHttpProxy !== undefined) {
      process.env.HTTP_PROXY = originalHttpProxy;
    } else {
      delete process.env.HTTP_PROXY;
    }
    
    if (originalHttpsProxy !== undefined) {
      process.env.HTTPS_PROXY = originalHttpsProxy;
    } else {
      delete process.env.HTTPS_PROXY;
    }
    
    if (!response.ok) {
      console.log(`❌ HTTP ошибка: ${response.status}`);
      return { 
        success: false, 
        status: response.status,
        message: `HTTP ${response.status}`
      };
    }
    
    const text = await response.text();
    let ip;
    
    try {
      const data = JSON.parse(text);
      ip = data.ip;
    } catch {
      ip = text.trim();
    }
    
    console.log(`✅ HTTP тест пройден! IP: ${ip}`);
    
    return {
      success: true,
      ip: ip,
      message: 'Прокси работает через env vars'
    };
    
  } catch (error) {
    // Всегда восстанавливаем переменные окружения при ошибке
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    
    if (error.name === 'AbortError') {
      console.log('❌ Таймаут HTTP теста');
      return { success: false, message: 'Таймаут' };
    }
    
    console.error('❌ Ошибка HTTP теста:', error.message);
    return { 
      success: false, 
      message: error.message,
      error: error.name 
    };
  }
}

// =========================================================
// ИНИЦИАЛИЗАЦИЯ OPENAI С ПРОКСИ (через переменные окружения)
// =========================================================

function createOpenAIClientWithProxy() {
  console.log('🔧 Инициализация OpenAI клиента...');

  const apiKey = appSettings.openai_key;
  const proxyUrl = appSettings.proxy;

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY отсутствует');
    return null;
  }

  console.log(`✅ API ключ: ***${apiKey.slice(-4)}`);
  
  if (proxyUrl) {
    console.log(`✅ Прокси настроен: ${proxyUrl.replace(/\/\/([^:@]+):([^:@]+)@/, '//****:****@')}`);
  } else {
    console.log('⚠️  Прокси не настроен');
  }

  // Создаем кастомный fetch который использует переменные окружения для прокси
  const customFetch = async (url, init = {}) => {
    const isOpenAI = url.toString().includes('api.openai.com');
    
    // Сохраняем оригинальные переменные окружения
    const originalHttpProxy = process.env.HTTP_PROXY;
    const originalHttpsProxy = process.env.HTTPS_PROXY;
    
    // Для запросов к OpenAI устанавливаем переменные окружения
    if (isOpenAI && proxyUrl) {
      process.env.HTTP_PROXY = proxyUrl;
      process.env.HTTPS_PROXY = proxyUrl;
      
      console.log(`🌐 [Proxy] Отправка запроса к OpenAI через env vars`);
    }
    
    const options = { 
      ...init,
      timeout: 30000,
      signal: init.signal || (() => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 30000);
        return controller.signal;
      })()
    };
    
    try {
      const response = await fetch(url, options);
      
      // Восстанавливаем оригинальные переменные окружения
      if (originalHttpProxy !== undefined) {
        process.env.HTTP_PROXY = originalHttpProxy;
      } else {
        delete process.env.HTTP_PROXY;
      }
      
      if (originalHttpsProxy !== undefined) {
        process.env.HTTPS_PROXY = originalHttpsProxy;
      } else {
        delete process.env.HTTPS_PROXY;
      }
      
      return response;
    } catch (error) {
      // Всегда восстанавливаем переменные окружения при ошибке
      if (originalHttpProxy !== undefined) {
        process.env.HTTP_PROXY = originalHttpProxy;
      } else {
        delete process.env.HTTP_PROXY;
      }
      
      if (originalHttpsProxy !== undefined) {
        process.env.HTTPS_PROXY = originalHttpsProxy;
      } else {
        delete process.env.HTTPS_PROXY;
      }
      
      console.error(`❌ Ошибка запроса:`, error.message);
      throw error;
    }
  };

  // Создаем клиента OpenAI с кастомным fetch
  const client = new OpenAI({
    apiKey: apiKey,
    fetch: customFetch,
    maxRetries: 0,
  });

  console.log('✅ OpenAI клиент инициализирован');
  return client;
}

// =========================================================
// ТЕСТ OPENAI
// =========================================================

async function testOpenAIConnection() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 ТЕСТ OPENAI');
  console.log('='.repeat(50));
  
  const requestId = Math.random().toString(36).slice(2, 9);
  
  console.log(`\n🔍 [${requestId}] Проверяем конфигурацию...`);
  
  if (!appSettings.openai_key) {
    console.error('❌ OPENAI_API_KEY не найден');
    return { overall: false, message: 'No API key' };
  }
  
  console.log(`✅ API ключ: ***${appSettings.openai_key.slice(-4)}`);
  if (appSettings.proxy) {
    console.log(`✅ Прокси настроен`);
    
    // Быстрый TCP тест прокси
    console.log(`\n🔍 [${requestId}] Быстрый TCP тест прокси...`);
    const tcpTest = await testProxyTcpOnly();
    if (!tcpTest.success) {
      console.log('⚠️  Прокси недоступен по TCP');
    } else {
      console.log('✅ Прокси доступен по TCP');
    }
  } else {
    console.log('⚠️  Прокси не настроен');
  }
  
  // Инициализируем клиент, если еще не создан
  if (!openaiClient) {
    console.log(`\n🔍 [${requestId}] Инициализируем OpenAI клиент...`);
    openaiClient = createOpenAIClientWithProxy();
  }
  
  if (!openaiClient) {
    console.error('❌ Не удалось создать OpenAI клиент');
    return { overall: false, message: 'Client creation failed' };
  }
  
  // Тест OpenAI через прокси
  console.log(`\n🔍 [${requestId}] Тестируем OpenAI через прокси...`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const models = await openaiClient.models.list({
      signal: controller.signal,
      timeout: 25000
    });
    
    clearTimeout(timeoutId);
    
    console.log(`✅ OpenAI работает через прокси!`);
    console.log(`   Доступно моделей: ${models.data.length}`);
    
    // Быстрая проверка моделей
    const modelNames = models.data.map(m => m.id);
    const hasGPT4 = modelNames.some(m => m.includes('gpt-4'));
    const hasGPT35 = modelNames.some(m => m.includes('gpt-3.5'));
    
    console.log(`📋 Доступные модели:`);
    console.log(`   • GPT-4: ${hasGPT4 ? '✅' : '❌'}`);
    console.log(`   • GPT-3.5: ${hasGPT35 ? '✅' : '❌'}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ OPENAI РАБОТАЕТ ЧЕРЕЗ ПРОКСИ');
    console.log('='.repeat(50) + '\n');
    
    return { 
      overall: true, 
      connection: true,
      models: true,
      viaProxy: !!appSettings.proxy,
      message: 'OpenAI работает через прокси'
    };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️ [${requestId}] Таймаут теста OpenAI`);
      return { 
        overall: false, 
        connection: false,
        error: 'Timeout'
      };
    }
    
    console.error(`❌ [${requestId}] Ошибка OpenAI:`, {
      message: error.message,
      status: error?.status,
      code: error?.code
    });
    
    return { 
      overall: false, 
      connection: false,
      error: error.message
    };
  }
}

// =========================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =========================================================

async function quickProxyTest(requestId) {
  console.log(`⚡ [${requestId}] Быстрый тест прокси...`);
  return await testProxyTcpOnly();
}

async function testProxyConnection(requestId) {
  console.log(`🔍 [${requestId}] Полный тест прокси...`);
  
  const tcpResult = await testProxyTcpOnly();
  const httpResult = await testProxyHttp();
  
  return {
    tcp: tcpResult,
    http: httpResult,
    overall: tcpResult.success && httpResult.success
  };
}

// =========================================================
// ЭНДПОИНТЫ ДЛЯ ДИАГНОСТИКИ
// =========================================================

app.get('/api/debug/proxy-check', async (req, res) => {
  try {
    const result = await testProxyHttp();
    
    res.json({
      success: result.success,
      proxy: {
        configured: !!appSettings.proxy,
        url_masked: appSettings.proxy ? 
          appSettings.proxy.replace(/\/\/([^:@]+):([^:@]+)@/, '//****:****@') : 
          'не настроен'
      },
      details: result,
      requestId: req.requestId
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

app.get('/api/debug/proxy-full', async (req, res) => {
  try {
    const result = await testProxyConnection(req.requestId);
    
    res.json({
      success: result.overall,
      tcp: result.tcp,
      http: result.http,
      requestId: req.requestId
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

app.get('/api/debug/openai-test', async (req, res) => {
  try {
    const testResult = await testOpenAIConnection();
    res.json({
      success: testResult.overall,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      details: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

// =========================================================
// БАЗА ДАННЫХ ДЛЯ VPS
// =========================================================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myskaz',
  waitForConnections: true,
  connectionLimit: 10
};

let pool;

async function initDB() {
  try {
    logToFile('info', 'Начинаем инициализацию базы данных...');
    
    pool = mysql.createPool(dbConfig);
    
    const connection = await pool.getConnection();
    logToFile('success', 'Подключение к MySQL успешно');
    connection.release();

    // Создаем таблицы если их нет
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        child_name VARCHAR(255),
        credits INT DEFAULT 3,
        tier VARCHAR(50),
        data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tales (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        title VARCHAR(255),
        status VARCHAR(50),
        data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255),
        type VARCHAR(50),
        message TEXT,
        details LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        openai_key TEXT,
        proxy TEXT
      )
    `);

    // Загружаем настройки из БД
    const [settings] = await pool.query('SELECT * FROM settings WHERE id = 1');
    if (settings.length) {
      appSettings = {
        openai_key: process.env.OPENAI_API_KEY || settings[0].openai_key || '',
        proxy: process.env.HTTP_PROXY || process.env.HTTPS_PROXY || settings[0].proxy || ''
      };
      logToFile('info', 'Настройки загружены из БД');
    }
    
    openaiClient = createOpenAIClientWithProxy();

    // Создаем администратора по умолчанию если нет
    const [admins] = await pool.query('SELECT * FROM admins');
    if (!admins.length) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@myskaz.ru';
      await pool.query(
        'INSERT INTO admins (email) VALUES (?)',
        [adminEmail]
      );
      logToFile('info', 'Создан администратор по умолчанию', { email: adminEmail });
    }
    
    // Тестируем подключение асинхронно
    setTimeout(async () => {
      try {
        await testOpenAIConnection();
      } catch (testError) {
        console.log('⚠️  Ошибка тестирования OpenAI:', testError.message);
      }
    }, 2000);
    
    logToFile('success', 'Database & OpenAI initialized');
  } catch (error) {
    logToFile('error', 'Ошибка инициализации базы данных', error);
    
    console.log('⚠️  Продолжаем работу без базы данных...');
    pool = null;
    openaiClient = createOpenAIClientWithProxy();
  }
}

// =========================================================
// MULTER ДЛЯ ЗАГРУЗКИ ФАЙЛОВ
// =========================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.body.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${userId}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

// =========================================================
// ГЕНЕРАЦИЯ ИСТОРИИ С GPT-4.1-MINI
// =========================================================

const Page = z.object({
  text: z.string(),
  imagePrompt: z.string(),
});

const Book = z.object({
  title: z.string(),
  pages: z.array(Page),
});

async function generateStoryWithGPT41({ params, requestId }) {
  const prompt = `
Напиши детскую сказку.

Имя ребенка: ${params.childName}
Тема: ${params.theme}
Контекст: ${params.hook || ''}

Формат строго JSON:
{
  "title": "Название сказки",
  "pages": [
    { "text": "Текст страницы (2-3 предложения)", "imagePrompt": "Описание для генерации изображения на английском" }
  ]
}

Ровно 8 страниц.
Сделай текст увлекательным и подходящим для детей.
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    logToFile('info', `[${requestId}] Отправка запроса в gpt-5-mini`, {
      childName: params.childName,
      theme: params.theme,
      proxyUsed: !!appSettings.proxy
    });
    
    const response = await openaiClient.chat.completions.parse({
      model: 'gpt-5-mini',
      messages: [{ role: "system", content: prompt }],
      response_format: zodResponseFormat(Book, 'book'),
    }, { signal: controller.signal });

    clearTimeout(timeout);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI response has no readable content');
    }

    logToFile('success', `[${requestId}] Ответ от gpt-5-mini получен`, {
      contentLength: content.length,
      viaProxy: !!appSettings.proxy
    });

    const story = JSON.parse(content);

    return {
      ...story,
      requestId,
      generatedAt: new Date().toISOString(),
      model: 'gpt-5-mini',
      viaProxy: !!appSettings.proxy
    };

  } catch (error) {
    clearTimeout(timeout);
    
    logToFile('error', `[${requestId}] Ошибка генерации gpt-5-mini`, {
      message: error.message,
      name: error.name,
      viaProxy: !!appSettings.proxy
    });
    
    throw error;
  }
}

// =========================================================
// ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ С GPT-IMAGE-1
// =========================================================

async function generateImageWithGPTImage1({ prompt, style, requestId, userId }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    logToFile('info', `[${requestId}] Генерация изображения через GPT-Image-1`, {
      userId,
      style,
      promptLength: prompt.length,
      proxyUsed: !!appSettings.proxy
    });
    
    const result = await openaiClient.images.generate({
      model: 'gpt-image-1',
      prompt: `Children book illustration, ${style || 'cartoon style'}. ${prompt}`,
      size: '1024x1024',
      quality: 'standard',
      n: 1
    }, { signal: controller.signal });

    clearTimeout(timeout);

    const imageUrl = result.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL in response from GPT-Image-1');
    }
    
    logToFile('success', `[${requestId}] Изображение сгенерировано GPT-Image-1`, { 
      userId,
      viaProxy: !!appSettings.proxy
    });
    
    return {
      imageUrl,
      model: 'gpt-image-1',
      viaProxy: !!appSettings.proxy
    };
    
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// =========================================================
// MIDDLEWARE ДЛЯ VPS
// =========================================================

const allowedOrigins = [
  SITE_URL,
  'https://www.' + DOMAIN,
  'https://web.telegram.org',
  'https://web.telegram.org/',
  'https://web.telegram.org/k/',
  'http://localhost:5173',
  'http://localhost:' + PORT,
  'http://localhost:3000',
  'http://localhost:8080'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logToFile('warn', 'CORS blocked origin', { origin });
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  req.requestId = requestId;
  
  logToFile('info', `Request ${requestId}: ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    ip: req.ip
  });
  
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    logToFile('debug', `Response ${requestId}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    return originalSend.call(this, body);
  };
  
  next();
});

// =========================================================
// ЭНДПОИНТЫ ДЛЯ VPS
// =========================================================

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API работает!',
    timestamp: new Date().toISOString(),
    domain: DOMAIN,
    apiUrl: API_URL,
    proxy: {
      enabled: !!appSettings.proxy,
      forOpenAIOnly: true
    },
    openai: {
      clientReady: !!openaiClient,
      textModel: 'gpt-4.1-mini',
      imageModel: 'gpt-image-1'
    }
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    hosting: 'VPS',
    domain: DOMAIN,
    apiUrl: API_URL,
    port: PORT,
    timestamp: new Date().toISOString(),
    proxy: {
      configured: !!appSettings.proxy,
      forOpenAIOnly: true
    }
  });
});

// Эндпоинты для диагностики
app.get('/api/debug/test-proxy-tcp', async (req, res) => {
  try {
    const result = await quickProxyTest(req.requestId);
    res.json({
      success: result.success,
      proxy: appSettings.proxy ? 'configured' : 'not configured',
      details: result,
      requestId: req.requestId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

app.get('/api/debug/test-proxy-full', async (req, res) => {
  try {
    const result = await testProxyConnection(req.requestId);
    res.json({
      success: result.overall,
      details: result,
      requestId: req.requestId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

app.get('/api/debug/openai-test', async (req, res) => {
  try {
    const testResult = await testOpenAIConnection();
    res.json({
      success: testResult.overall,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      details: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.requestId
    });
  }
});

// 🔴 ОСНОВНОЙ ЭНДПОИНТ ГЕНЕРАЦИИ ТЕКСТА
app.post('/api/generate/story', async (req, res) => {
  const { params, userId } = req.body;
  const requestId = req.requestId;

  logToFile('info', `[${requestId}] Генерация сказки GPT-4.1-mini`, { userId });

  if (!params || !userId) {
    return res.status(400).json({
      error: 'Missing required fields',
      requestId
    });
  }

  if (!openaiClient) {
    return res.status(500).json({
      error: 'OpenAI client not initialized',
      requestId
    });
  }

  try {
    const story = await generateStoryWithGPT41({
      params,
      requestId
    });

    res.json(story);

  } catch (error) {
    const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');
    
    logToFile('error', `[${requestId}] Ошибка генерации GPT-4.1-mini`, error);
    
    // 🔴 FALLBACK: Если не удалось, возвращаем тестовую сказку
    const fallbackStory = {
      title: `Сказка для ${params.childName}`,
      pages: Array(8).fill(0).map((_, i) => ({
        text: `Страница ${i + 1}: Удивительная история о ${params.theme}.`,
        imagePrompt: `${params.theme} magical scene for children's book illustration`
      })),
      fallback: true,
      requestId,
      model: 'fallback',
      error: isTimeout ? 'GPT-4.1-mini timeout' : 'GPT-4.1-mini error'
    };
    
    res.json(fallbackStory);
  }
});

// 🔴 ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ GPT-IMAGE-1
app.post('/api/generate/image', async (req, res) => {
  const { prompt, style, userId } = req.body;
  const requestId = req.requestId;
  
  if (!prompt || !userId) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      requestId 
    });
  }
  
  logToFile('info', `[${requestId}] Генерация изображения GPT-Image-1`, { 
    userId, 
    style 
  });

  if (!openaiClient) {
    return res.status(500).json({ 
      error: 'OpenAI client not initialized',
      requestId 
    });
  }

  try {
    const result = await generateImageWithGPTImage1({
      prompt,
      style,
      requestId,
      userId
    });

    res.json({ 
      imageUrl: result.imageUrl,
      requestId,
      model: result.model,
      viaProxy: result.viaProxy
    });
  } catch (e) {
    logToFile('error', `[${requestId}] Ошибка генерации изображения GPT-Image-1`, e);
    
    // 🔴 FALLBACK: Возвращаем заглушку
    res.json({ 
      imageUrl: 'https://placehold.co/600x400/FFD700/000?text=GPT-Image-1+Failed',
      fallback: true,
      requestId,
      model: 'fallback',
      error: e.message
    });
  }
});

// =========================================================
// ПОЛЬЗОВАТЕЛИ И СКАЗКИ
// =========================================================

app.post('/api/user', upload.array('photos'), async (req, res) => {
  const requestId = req.requestId;
  
  try {
    const u = req.body;

    if (!u.id) {
      return res.status(400).json({ error: 'No ID provided', requestId });
    }

    const savedPhotos = (req.files || []).map(file => file.path);

    const id = String(u.id);
    const name = String(u.name || 'Герой');
    const childName = String(u.childName || u.child_name || '');
    const credits = parseInt(u.credits) || 3;
    const tier = String(u.tier || 'FREE');

    if (pool) {
      const [existingRows] = await pool.query('SELECT data FROM users WHERE id=?', [id]);
      let existingData = {};
      
      if (existingRows.length) {
        try {
          existingData = JSON.parse(existingRows[0].data || '{}');
        } catch (parseError) {
          logToFile('error', 'Ошибка парсинга данных пользователя', parseError);
        }
      }

      const existingPhotos = existingData.childPhotos || [];
      const allPhotos = [...existingPhotos, ...savedPhotos];

      const data = JSON.stringify({
        ...existingData,
        name: name,
        childName: childName,
        childPhotos: allPhotos,
        credits: credits,
        tier: tier,
        lastUpdated: new Date().toISOString()
      });

      await pool.query(`
        INSERT INTO users (id, name, child_name, credits, tier, data)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          child_name = VALUES(child_name),
          credits = VALUES(credits),
          tier = VALUES(tier),
          data = VALUES(data)
      `, [id, name, childName, credits, tier, data]);
    } else {
      logToFile('warn', 'База данных не доступна, сохраняем только файлы');
    }

    res.json({ 
      success: true, 
      photos: savedPhotos,
      requestId,
      dbAvailable: !!pool
    });
    
  } catch (e) {
    logToFile('error', `[${requestId}] User Save Error:`, e);
    res.status(500).json({ error: 'Save failed', requestId });
  }
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/user/:id', async (req, res) => {
  const requestId = req.requestId;
  
  try {
    const userId = req.params.id;
    
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [userId]);
      if (rows.length) {
        const user = rows[0];
        let extraData = {};
        
        if (user.data) {
          try {
            extraData = typeof user.data === 'string' ? JSON.parse(user.data) : user.data;
          } catch (e) {
            logToFile('error', `[${requestId}] JSON Parse Error in getUser:`, e);
          }
        }

        const response = {
          id: String(user.id),
          telegramId: String(user.id),
          name: user.name || extraData.name || '',
          childName: user.child_name || extraData.childName || '',
          credits: user.credits !== undefined ? user.credits : (extraData.credits ?? 3),
          tier: user.tier || extraData.tier || 'FREE',
          childPhotos: extraData.childPhotos || [],
          extraCharacters: extraData.extraCharacters || [],
          createdAt: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
          requestId,
          dbAvailable: true
        };

        return res.json(response);
      }
    }
    
    res.json({
      id: userId,
      telegramId: userId,
      name: '',
      childName: '',
      credits: 3,
      tier: 'FREE',
      childPhotos: [],
      extraCharacters: [],
      createdAt: Date.now(),
      requestId,
      dbAvailable: !!pool
    });
    
  } catch (e) {
    logToFile('error', `[${requestId}] Error fetching user:`, e);
    res.status(500).json({ error: 'Server error', requestId });
  }
});

// =========================================================
// Сказки
// =========================================================

app.get('/api/tales/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tales WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json(rows.map(r => ({ ...JSON.parse(r.data), id: r.id, createdAt: r.created_at })));
  } catch (e) {
    console.error(`Error fetching tales for user ${req.params.userId}`, e.message);
    res.status(500).send();
  }
});

app.post('/api/tales/save', async (req, res) => {
  const { userId, tale } = req.body;
  try {
    const processedPages = tale.pages?.map((p, i) => ({
      ...p,
      imageUrl: saveBase64Image(p.imageUrl, userId, `page_${tale.id}_${i}`)
    })) || [];

    const updatedTale = { ...tale, pages: processedPages };

    await pool.query(`INSERT INTO tales (id, user_id, title, status, data) 
      VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status), data=VALUES(data)`,
      [tale.id, userId, tale.title, tale.status, JSON.stringify(updatedTale)]);

    console.info('Tale saved/updated', `TaleID: ${tale.id}, User: ${userId}, Status: ${tale.status}`);
    res.json({ success: true });
  } catch (e) {
    console.error(`Failed to save tale ${tale.id} for user ${userId}`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// =========================================================
// СТАТИЧЕСКИЕ ФАЙЛЫ
// =========================================================

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    requestId: req.requestId 
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// =========================================================
// ЗАПУСК СЕРВЕРА НА VPS
// =========================================================

async function startServer() {
  try {
    const dirs = ['uploads', 'logs'];
    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Создана директория: ${dir}`);
      }
    });
    
    logToFile('info', 'Запуск сервера...', { 
      port: PORT, 
      domain: DOMAIN,
      proxy: !!appSettings.proxy
    });
    
    await initDB();
    
    const listenIP = process.env.VPS_IP || '0.0.0.0';
    
    app.listen(PORT, listenIP, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 СЕРВЕР ЗАПУЩЕН');
      console.log('='.repeat(50));
      console.log(`🌐 Домен: ${DOMAIN}`);
      console.log(`🔗 URL: ${SITE_URL}`);
      console.log(`🔗 API URL: ${API_URL}`);
      console.log(`📊 Внутренний порт: ${PORT} (IP: ${listenIP})`);
      console.log(`🔐 HTTPS: Включен через Apache`);
      console.log(`🤖 Текст: gpt-4.1-mini`);
      console.log(`🎨 Изображения: gpt-image-1`);
      console.log(`📁 Логи: ${logFile}`);
      console.log('='.repeat(50));
      console.log('\n📋 ТЕСТОВЫЕ ЭНДПОИНТЫ:');
      console.log(`  GET  ${API_URL}/test`);
      console.log(`  GET  ${API_URL}/info`);
      console.log(`  GET  ${API_URL}/debug/proxy-check`);
      console.log(`  GET  ${API_URL}/debug/proxy-full`);
      console.log(`  GET  ${API_URL}/debug/openai-test`);
      console.log(`  POST ${API_URL}/generate/story`);
      console.log('='.repeat(50));
      console.log('\n⚠️  ДЛЯ ТЕЛЕГРАМ:');
      console.log(`  WebApp URL: ${SITE_URL}`);
      console.log(`  API Base: ${API_URL}`);
      console.log('='.repeat(50) + '\n');
      
      logToFile('success', `Server running on port ${PORT}`);
    });
  } catch (e) {
    logToFile('error', 'Failed to start server:', e);
    console.error('❌ Ошибка запуска сервера:', e.message);
    process.exit(1);
  }
}

// =========================================================
// СКРИПТ ДЛЯ ЗАПУСКА
// =========================================================

const args = process.argv.slice(2);
if (args.includes('--check')) {
  console.log('🔍 Проверка конфигурации...');
  console.log('PORT:', PORT);
  console.log('DOMAIN:', DOMAIN);
  console.log('DB_HOST:', dbConfig.host);
  console.log('DB_USER:', dbConfig.user);
  console.log('DB_NAME:', dbConfig.database);
  console.log('PROXY:', appSettings.proxy ? 'configured' : 'not configured');
  process.exit(0);
}

startServer();
