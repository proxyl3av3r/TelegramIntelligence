# Media Space Backend

Node.js + Express + SQLite backend for the Media Space (Медіа Простір) application.

## Features

- JWT Authentication
- SQLite Database (auto-initializes on first run)
- File uploads (images & PDFs)
- RESTful API
- CORS enabled

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

### 3. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on port 3001 (or PORT from .env).

## Default Admin User

On first run, a default admin user is created:
- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change this password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Channels
- `GET /api/channels` - List all channels (optional: ?region=&ratingColor=&search=)
- `GET /api/channels/:id` - Get single channel with tabs
- `POST /api/channels` - Create channel (admin only)
- `PUT /api/channels/:id` - Update channel (admin only)
- `DELETE /api/channels/:id` - Delete channel (admin only)

### Tabs
- `POST /api/channels/:channelId/tabs` - Add tab (admin only)
- `PUT /api/tabs/:tabId` - Update tab (admin only)
- `DELETE /api/tabs/:tabId` - Delete tab (admin only)

### Content
- `PUT /api/tabs/:tabId/owner-content` - Update owner tab content (admin only)
- `POST /api/tabs/:tabId/blocks` - Add overview block (admin only)
- `PUT /api/blocks/:blockId` - Update block (admin only)
- `DELETE /api/blocks/:blockId` - Delete block (admin only)

### Uploads
- `POST /api/upload/image` - Upload image (auth required)
- `POST /api/upload/pdf` - Upload PDF (auth required)

### Other
- `GET /api/stats` - Get stats
- `GET /api/health` - Health check

## Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name media-space-api

# Save PM2 config
pm2 save
pm2 startup
```

### Using Docker

```bash
# Build image
docker build -t media-space-backend .

# Run container
docker run -p 3001:3001 -v $(pwd)/uploads:/app/uploads -v $(pwd)/database.sqlite:/app/database.sqlite media-space-backend
```

### Manual Deployment

1. Upload files to server
2. Run `npm install --production`
3. Copy `.env.example` to `.env` and configure
4. Start with `npm start` or use a process manager like PM2

## File Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
├── database.sqlite    # SQLite database (created on first run)
├── uploads/           # Uploaded files (created on first run)
│   ├── image/         # Image uploads
│   └── pdf/           # PDF uploads
└── README.md          # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| JWT_SECRET | Secret for JWT tokens | (required) |
| CORS_ORIGIN | Allowed CORS origin | * |
