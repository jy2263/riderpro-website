const express = require('express');
const initSqlJs = require('sql.js');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'riderpro.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let db;

// Initialize SQLite Database
async function initDatabase() {
  try {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log('✅ Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('✅ New database created');
    }

    // Create users table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Save database to file
    saveDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Save database to file
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;

    // Validate input
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser[0] && existingUser[0].values.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    db.run('INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)',
           [fullname, email, phone, hashedPassword]);

    // Save database
    saveDatabase();

    res.status(201).json({
      success: true,
      message: 'Registration successful!'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (!result[0] || result[0].values.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userRow = result[0].values[0];
    const user = {
      id: userRow[0],
      fullname: userRow[1],
      email: userRow[2],
      phone: userRow[3],
      password: userRow[4]
    };

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get all users (for debugging - remove in production)
app.get('/api/users', (req, res) => {
  try {
    const result = db.exec('SELECT id, fullname, email, phone, created_at FROM users');
    const users = [];
    if (result[0]) {
      result[0].values.forEach(row => {
        users.push({
          id: row[0],
          fullname: row[1],
          email: row[2],
          phone: row[3],
          created_at: row[4]
        });
      });
    }
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 RiderPro Backend Server is running!`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🗄️  Database: riderpro.db`);
    console.log(`\n📝 API Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/register - Register new user`);
    console.log(`   POST http://localhost:${PORT}/api/login - User login`);
    console.log(`   GET  http://localhost:${PORT}/api/users - Get all users (debug)\n`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    saveDatabase();
    db.close();
  }
  console.log('\n✅ Database saved and closed');
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
