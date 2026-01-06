// server.js - Backend Server with Debug Logging
// Replace your current server.js with this

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const users = [];

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    users: users.length 
  });
});

app.get('/api/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({ users: usersWithoutPasswords });
});

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Password length:', password ? password.length : 0);
    console.log('Password received:', password); // TEMPORARY DEBUG
    console.log('==========================');
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }
    
    const user = {
      id: Date.now().toString(),
      email,
      username: username || email.split('@')[0],
      password, // Stored as plain text
      name: username || email.split('@')[0],
      spotifyConnected: false,
      createdAt: new Date()
    };
    
    users.push(user);
    console.log('✅ User registered:', user.email);
    console.log('Stored password:', user.password); // TEMPORARY DEBUG
    
    const token = 'mock_jwt_token_' + user.id + '_' + Date.now();
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login with DETAILED DEBUG
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Email received:', email);
    console.log('Email type:', typeof email);
    console.log('Password received:', password);
    console.log('Password type:', typeof password);
    console.log('Password length:', password ? password.length : 0);
    console.log('Total users:', users.length);
    
    // Show all users (ONLY FOR DEBUG!)
    console.log('All users in database:');
    users.forEach((u, index) => {
      console.log(`  User ${index}:`);
      console.log(`    Email: "${u.email}"`);
      console.log(`    Email match: ${u.email === email}`);
      console.log(`    Stored password: "${u.password}"`);
      console.log(`    Password match: ${u.password === password}`);
      console.log(`    Password === check: ${u.password === password}`);
      console.log(`    Password == check: ${u.password == password}`);
    });
    console.log('==================');
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    const user = users.find(u => {
      const emailMatch = u.email === email;
      const passwordMatch = u.password === password;
      console.log(`Checking user ${u.email}: email=${emailMatch}, password=${passwordMatch}`);
      return emailMatch && passwordMatch;
    });
    
    if (!user) {
      console.log('❌ Login failed: Invalid credentials');
      console.log('No matching user found!');
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    console.log('✅ User logged in:', user.email);
    
    const token = 'mock_jwt_token_' + user.id + '_' + Date.now();
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = users[0] || {
    id: '1',
    email: 'demo@example.com',
    username: 'demo',
    name: 'Demo User',
    spotifyConnected: false
  };
  
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.get('/api/auth/spotify', (req, res) => {
  res.json({ 
    message: 'Spotify auth endpoint',
    note: 'Set up Spotify OAuth to enable this'
  });
});

app.post('/api/auth/spotify/callback', (req, res) => {
  if (users.length > 0) {
    users[0].spotifyConnected = true;
    users[0].spotifyUserId = 'spotify_user_' + Date.now();
    const { password, ...user } = users[0];
    res.json({ user });
  } else {
    res.status(404).json({ message: 'No user found' });
  }
});

app.post('/api/auth/spotify/disconnect', (req, res) => {
  if (users.length > 0) {
    users[0].spotifyConnected = false;
    users[0].spotifyUserId = null;
    const { password, ...user } = users[0];
    res.json({ user });
  } else {
    res.status(404).json({ message: 'No user found' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Backend Server Started (DEBUG MODE)');
  console.log('='.repeat(50));
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`📍 Health:     http://localhost:${PORT}/health`);
  console.log(`✅ CORS:       Enabled for http://localhost:4200`);
  console.log('='.repeat(50) + '\n');
  console.log('🐛 Debug logging enabled');
  console.log('👂 Listening for requests...\n');
});