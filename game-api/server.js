import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

const app = express();
const port = 3008;

// Функция для генерации уникального ID ошибки
function generateErrorId() {
    return crypto.randomBytes(8).toString('hex');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/ask', async (req, res) => {
  try {
  const { question } = req.body;
  if (!question) {
  return res.status(400).json({ error: 'Question is required' });
  }
  
  const prompt = `[INST] Вопрос об игре Space Shooter: ${question} [/INST]`;
  const pythonScriptPath = path.join(__dirname, 'model_interface.py');
  console.log(`Executing Python script: python3 "${pythonScriptPath}" "${prompt}"`);
  
  const { stdout, stderr } = await execAsync(`python3 "${pythonScriptPath}" "${prompt}"`);
  
  if (stderr) {
  console.error('Python Error:', stderr);
  const errorId = generateErrorId();
  console.error(`Error ID: ${errorId}`, stderr);
  return res.status(500).json({ error: 'An error occurred while processing the request', errorId });
  }
  
  console.log('Python script output:', stdout);
  
  const { response } = JSON.parse(stdout);
  res.json({ answer: response.trim() });
  } catch (error) {
  const errorId = generateErrorId();
  console.error(`Error ID: ${errorId}`, error);
  res.status(500).json({ error: 'An error occurred while processing the request', errorId });
  }
  });
  
  // Middleware для обработки ошибок
  app.use((err, req, res, next) => {
  const errorId = generateErrorId();
  console.error(`Error ID: ${errorId}`, err.stack);
  res.status(500).json({
  message: 'Произошла внутренняя ошибка сервера',
  errorId: errorId
  });
  });
  
  // Запуск сервера
  app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  });