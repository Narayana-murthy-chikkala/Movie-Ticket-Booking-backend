const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: 'https://movie-ticket-booking-frontend-sigma.vercel.app' }));
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

async function initializeUsersFile() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([]));
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the authentication API. Use /api/login or /api/signup.' });
});

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  try {
    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    let users = JSON.parse(usersData);
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    users.push({ email, password });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true, message: 'User registered successfully', user: { email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  try {
    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    let users = JSON.parse(usersData);
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.password === password) {
        res.json({ success: true, message: 'Login successful', user: { email } });
      } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ success: false, message: 'User not found. Please sign up.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initializeUsersFile();
  console.log(`Server running on http://localhost:${PORT}`);
});