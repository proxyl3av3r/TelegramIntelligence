const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Channels table
    db.run(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        avatar TEXT,
        description TEXT,
        category TEXT,
        region TEXT CHECK(region IN ('all', 'kharkiv')),
        rating_color TEXT CHECK(rating_color IN ('red', 'green', 'purple')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Channel tabs table
    db.run(`
      CREATE TABLE IF NOT EXISTS channel_tabs (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        name_uk TEXT NOT NULL,
        name_en TEXT NOT NULL,
        template TEXT NOT NULL CHECK(template IN ('owner', 'overview')),
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
      )
    `);

    // Tab content for owner/admin template
    db.run(`
      CREATE TABLE IF NOT EXISTS owner_tab_content (
        id TEXT PRIMARY KEY,
        tab_id TEXT NOT NULL,
        photo TEXT,
        full_name TEXT,
        birth_date TEXT,
        birth_place TEXT,
        residence TEXT,
        phone TEXT,
        media_activity TEXT,
        media_resources TEXT,
        social_networks TEXT,
        dossier_pdf TEXT,
        FOREIGN KEY (tab_id) REFERENCES channel_tabs(id) ON DELETE CASCADE
      )
    `);

    // Tab content blocks for overview template
    db.run(`
      CREATE TABLE IF NOT EXISTS overview_blocks (
        id TEXT PRIMARY KEY,
        tab_id TEXT NOT NULL,
        title_uk TEXT,
        title_en TEXT,
        content_uk TEXT,
        content_en TEXT,
        images TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (tab_id) REFERENCES channel_tabs(id) ON DELETE CASCADE
      )
    `);

    // Create default admin user if not exists
    const adminId = uuidv4();
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    db.get("SELECT * FROM users WHERE username = ?", ['admin'], (err, row) => {
      if (!row) {
        db.run(
          "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
          [adminId, 'admin', adminPassword, 'admin'],
          (err) => {
            if (err) {
              console.error('Error creating default admin:', err);
            } else {
              console.log('Default admin user created: admin / admin123');
            }
          }
        );
      }
    });

    console.log('Database tables initialized');
  });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, file.fieldname);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedPdfs = ['application/pdf'];
    
    if (file.fieldname === 'image' && allowedImages.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === 'pdf' && allowedPdfs.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password, secretCode } = req.body;

  if (!username || !password || !secretCode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate secret codes
  const USER_CODE = 'TELEGRAM_INTELLIGENCE_2024_SECURE_ACCESS';
  const ADMIN_CODE = 'TELEGRAM_INTELLIGENCE_2024_ADMIN_SUPER_ACCESS';

  let role;
  if (secretCode === USER_CODE) {
    role = 'user';
  } else if (secretCode === ADMIN_CODE) {
    role = 'admin';
  } else {
    return res.status(400).json({ error: 'Invalid secret code' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.run(
      'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
      [id, username, hashedPassword, role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        const token = jwt.sign({ id, username, role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id, username, role } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    }
  );
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ===== CHANNEL ROUTES =====

// Get all channels
app.get('/api/channels', (req, res) => {
  const { region, ratingColor, search } = req.query;
  
  let query = 'SELECT * FROM channels WHERE 1=1';
  const params = [];

  if (region && region !== 'all') {
    query += ' AND region = ?';
    params.push(region);
  }

  if (ratingColor && ratingColor !== 'all') {
    query += ' AND rating_color = ?';
    params.push(ratingColor);
  }

  if (search) {
    query += ' AND (name LIKE ? OR username LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, channels) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(channels);
  });
});

// Get single channel with tabs
app.get('/api/channels/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM channels WHERE id = ?', [id], (err, channel) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Get tabs
    db.all(
      'SELECT * FROM channel_tabs WHERE channel_id = ? ORDER BY sort_order',
      [id],
      (err, tabs) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Get content for each tab
        const tabPromises = tabs.map(tab => {
          return new Promise((resolve, reject) => {
            if (tab.template === 'owner') {
              db.get(
                'SELECT * FROM owner_tab_content WHERE tab_id = ?',
                [tab.id],
                (err, content) => {
                  if (err) reject(err);
                  else {
                    tab.content = content || null;
                    resolve(tab);
                  }
                }
              );
            } else {
              db.all(
                'SELECT * FROM overview_blocks WHERE tab_id = ? ORDER BY sort_order',
                [tab.id],
                (err, blocks) => {
                  if (err) reject(err);
                  else {
                    tab.blocks = blocks || [];
                    resolve(tab);
                  }
                }
              );
            }
          });
        });

        Promise.all(tabPromises)
          .then(tabsWithContent => {
            channel.tabs = tabsWithContent;
            res.json(channel);
          })
          .catch(error => {
            res.status(500).json({ error: error.message });
          });
      }
    );
  });
});

// Create channel (admin only)
app.post('/api/channels', authenticateToken, requireAdmin, (req, res) => {
  const { name, username, avatar, description, category, region, ratingColor, tabs } = req.body;

  const id = uuidv4();
  db.run(
    `INSERT INTO channels (id, name, username, avatar, description, category, region, rating_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, username, avatar, description, category, region, ratingColor],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Channel username already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      // Create tabs if provided
      if (tabs && tabs.length > 0) {
        const tabPromises = tabs.map((tab, index) => {
          return new Promise((resolve, reject) => {
            const tabId = uuidv4();
            db.run(
              'INSERT INTO channel_tabs (id, channel_id, name_uk, name_en, template, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
              [tabId, id, tab.nameUk, tab.nameEn, tab.template, index],
              (err) => {
                if (err) reject(err);
                else resolve(tabId);
              }
            );
          });
        });

        Promise.all(tabPromises)
          .then(() => {
            res.json({ id, message: 'Channel created successfully' });
          })
          .catch(error => {
            res.status(500).json({ error: error.message });
          });
      } else {
        res.json({ id, message: 'Channel created successfully' });
      }
    }
  );
});

// Update channel (admin only)
app.put('/api/channels/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, username, avatar, description, category, region, ratingColor } = req.body;

  db.run(
    `UPDATE channels SET name = ?, username = ?, avatar = ?, description = ?, 
     category = ?, region = ?, rating_color = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, username, avatar, description, category, region, ratingColor, id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Channel username already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      res.json({ message: 'Channel updated successfully' });
    }
  );
});

// Delete channel (admin only)
app.delete('/api/channels/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM channels WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({ message: 'Channel deleted successfully' });
  });
});

// ===== TAB ROUTES =====

// Add tab to channel (admin only)
app.post('/api/channels/:channelId/tabs', authenticateToken, requireAdmin, (req, res) => {
  const { channelId } = req.params;
  const { nameUk, nameEn, template } = req.body;

  const id = uuidv4();
  db.run(
    'INSERT INTO channel_tabs (id, channel_id, name_uk, name_en, template) VALUES (?, ?, ?, ?, ?)',
    [id, channelId, nameUk, nameEn, template],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ id, message: 'Tab created successfully' });
    }
  );
});

// Update tab (admin only)
app.put('/api/tabs/:tabId', authenticateToken, requireAdmin, (req, res) => {
  const { tabId } = req.params;
  const { nameUk, nameEn } = req.body;

  db.run(
    'UPDATE channel_tabs SET name_uk = ?, name_en = ? WHERE id = ?',
    [nameUk, nameEn, tabId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tab not found' });
      }

      res.json({ message: 'Tab updated successfully' });
    }
  );
});

// Delete tab (admin only)
app.delete('/api/tabs/:tabId', authenticateToken, requireAdmin, (req, res) => {
  const { tabId } = req.params;

  db.run('DELETE FROM channel_tabs WHERE id = ?', [tabId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tab not found' });
    }

    res.json({ message: 'Tab deleted successfully' });
  });
});

// ===== OWNER TAB CONTENT ROUTES =====

// Update owner tab content (admin only)
app.put('/api/tabs/:tabId/owner-content', authenticateToken, requireAdmin, (req, res) => {
  const { tabId } = req.params;
  const { photo, fullName, birthDate, birthPlace, residence, phone, mediaActivity, mediaResources, socialNetworks, dossierPdf } = req.body;

  db.get('SELECT * FROM owner_tab_content WHERE tab_id = ?', [tabId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      // Update existing
      db.run(
        `UPDATE owner_tab_content SET photo = ?, full_name = ?, birth_date = ?, birth_place = ?, 
         residence = ?, phone = ?, media_activity = ?, media_resources = ?, social_networks = ?, dossier_pdf = ?
         WHERE tab_id = ?`,
        [photo, fullName, birthDate, birthPlace, residence, phone, mediaActivity, mediaResources, socialNetworks, dossierPdf, tabId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Content updated successfully' });
        }
      );
    } else {
      // Insert new
      const id = uuidv4();
      db.run(
        `INSERT INTO owner_tab_content (id, tab_id, photo, full_name, birth_date, birth_place, 
         residence, phone, media_activity, media_resources, social_networks, dossier_pdf)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, tabId, photo, fullName, birthDate, birthPlace, residence, phone, mediaActivity, mediaResources, socialNetworks, dossierPdf],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Content created successfully' });
        }
      );
    }
  });
});

// ===== OVERVIEW BLOCKS ROUTES =====

// Add block to overview tab (admin only)
app.post('/api/tabs/:tabId/blocks', authenticateToken, requireAdmin, (req, res) => {
  const { tabId } = req.params;
  const { titleUk, titleEn, contentUk, contentEn, images } = req.body;

  const id = uuidv4();
  db.run(
    'INSERT INTO overview_blocks (id, tab_id, title_uk, title_en, content_uk, content_en, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, tabId, titleUk, titleEn, contentUk, contentEn, JSON.stringify(images || [])],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ id, message: 'Block created successfully' });
    }
  );
});

// Update block (admin only)
app.put('/api/blocks/:blockId', authenticateToken, requireAdmin, (req, res) => {
  const { blockId } = req.params;
  const { titleUk, titleEn, contentUk, contentEn, images } = req.body;

  db.run(
    'UPDATE overview_blocks SET title_uk = ?, title_en = ?, content_uk = ?, content_en = ?, images = ? WHERE id = ?',
    [titleUk, titleEn, contentUk, contentEn, JSON.stringify(images || []), blockId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Block not found' });
      }

      res.json({ message: 'Block updated successfully' });
    }
  );
});

// Delete block (admin only)
app.delete('/api/blocks/:blockId', authenticateToken, requireAdmin, (req, res) => {
  const { blockId } = req.params;

  db.run('DELETE FROM overview_blocks WHERE id = ?', [blockId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({ message: 'Block deleted successfully' });
  });
});

// ===== FILE UPLOAD ROUTES =====

// Upload image
app.post('/api/upload/image', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imageUrl = `/uploads/image/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Upload PDF
app.post('/api/upload/pdf', authenticateToken, upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF uploaded' });
  }

  const pdfUrl = `/uploads/pdf/${req.file.filename}`;
  res.json({ url: pdfUrl });
});

// ===== STATS ROUTE =====

app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM channels', [], (err, channelsRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get('SELECT COUNT(*) as count FROM users', [], (err, usersRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        channels: channelsRow.count,
        users: usersRow.count
      });
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;
