# Media Space - Deployment Guide

Повное руководство по развертыванию Media Space (Медіа Простір) с серверной синхронизацией данных.

## Структура проекта

```
media-space/
├── src/                    # Frontend React приложение
├── backend/                # Backend Node.js + Express + SQLite
├── dist/                   # Сборка frontend (создается автоматически)
├── package.json            # Frontend dependencies
└── DEPLOYMENT.md           # Этот файл
```

## Быстрый старт

### 1. Настройка Backend

```bash
cd backend

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env

# Редактирование .env
nano .env
```

В файле `.env` установите:
```
PORT=3001
JWT_SECRET=your-super-secret-key-here-change-this
```

**Важно:** Измените `JWT_SECRET` на случайную строку!

### 2. Запуск Backend

```bash
# Разработка
npm run dev

# Продакшн
npm start
```

Или с использованием PM2 (рекомендуется):
```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start server.js --name media-space-api

# Автозапуск при перезагрузке
pm2 save
pm2 startup
```

### 3. Настройка Frontend

В корневой папке проекта:

```bash
# Создание .env файла
cp .env.example .env

# Редактирование .env - установите URL вашего бэкенда
nano .env
```

В файле `.env`:
```
VITE_API_URL=http://51.222.159.95:3001/api
```

### 4. Сборка Frontend

```bash
# Установка зависимостей (если еще не установлены)
npm install

# Сборка
npm run build
```

После сборки папка `dist/` будет содержать готовое приложение.

### 5. Развертывание на сервере

#### Backend:
```bash
# На вашем сервере (51.222.159.95)
cd /var/www/media-space/backend

# Клонирование из GitHub
git clone <your-repo-url> .

# Установка зависимостей
npm install --production

# Настройка окружения
cp .env.example .env
nano .env  # Отредактируйте JWT_SECRET

# Запуск с PM2
pm2 start server.js --name media-space-api
pm2 save
```

#### Frontend:
```bash
# На вашем сервере
cd /var/www/media-space

# Клонирование
git clone <your-repo-url> .

# Установка зависимостей
npm install

# Сборка
npm run build

# Копирование dist в веб-сервер
sudo cp -r dist/* /var/www/html/
```

## GitHub Workflow

### Первоначальная настройка

1. Создайте репозиторий на GitHub
2. Загрузите код:

```bash
# В папке проекта
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/media-space.git
git push -u origin main
```

### Обновление на сервере

После внесения изменений:

```bash
# 1. Коммит изменений
git add .
git commit -m "Your changes description"
git push origin main

# 2. На сервере - обновление
ssh root@51.222.159.95
cd /var/www/media-space
git pull origin main

# 3. Пересборка frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/

# 4. Перезапуск backend (если нужно)
pm2 restart media-space-api
```

## API Endpoints

Бэкенд предоставляет следующие endpoints:

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Каналы
- `GET /api/channels` - Список каналов
- `GET /api/channels/:id` - Один канал
- `POST /api/channels` - Создать канал (admin)
- `PUT /api/channels/:id` - Обновить канал (admin)
- `DELETE /api/channels/:id` - Удалить канал (admin)

### Вкладки
- `POST /api/channels/:id/tabs` - Добавить вкладку (admin)
- `PUT /api/tabs/:id` - Обновить вкладку (admin)
- `DELETE /api/tabs/:id` - Удалить вкладку (admin)

### Контент
- `PUT /api/tabs/:id/owner-content` - Обновить контент владельца (admin)
- `POST /api/tabs/:id/blocks` - Добавить блок (admin)
- `PUT /api/blocks/:id` - Обновить блок (admin)
- `DELETE /api/blocks/:id` - Удалить блок (admin)

### Загрузка файлов
- `POST /api/upload/image` - Загрузить изображение
- `POST /api/upload/pdf` - Загрузить PDF

## Секретные коды

Для регистрации используются следующие коды:

- **Пользователь:** `TELEGRAM_INTELLIGENCE_2024_SECURE_ACCESS`
- **Администратор:** `TELEGRAM_INTELLIGENCE_2024_ADMIN_SUPER_ACCESS`

## Стандартный пользователь

При первом запуске создается администратор:
- **Логин:** `admin`
- **Пароль:** `admin123`

**Важно:** Смените пароль после первого входа!

## Проверка работоспособности

1. **Backend health check:**
   ```
   curl http://51.222.159.95:3001/api/health
   ```
   Должно вернуть: `{"status":"ok"}`

2. **API доступность:**
   ```
   curl http://51.222.159.95:3001/api/stats
   ```

3. **Frontend:**
   Откройте `http://51.222.159.95` в браузере

## Устранение неполадок

### Backend не запускается
```bash
# Проверьте логи
pm2 logs media-space-api

# Проверьте порт
netstat -tlnp | grep 3001

# Убейте процесс на порту 3001
kill -9 $(lsof -t -i:3001)
```

### Ошибки CORS
Убедитесь, что `CORS_ORIGIN` в `.env` бэкенда соответствует URL фронтенда.

### База данных
База данных SQLite создается автоматически при первом запуске.
Файл: `backend/database.sqlite`

## Безопасность

1. **Обязательно измените:**
   - `JWT_SECRET` в бэкенде
   - Пароль стандартного администратора

2. **Рекомендуется:**
   - Использовать HTTPS
   - Настроить firewall (только порты 80, 443, 3001)
   - Регулярно обновлять зависимости

## Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs media-space-api`
2. Проверьте права доступа к папкам
3. Убедитесь, что все зависимости установлены
