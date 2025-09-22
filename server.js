const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = 'your-very-secret-key-change-this';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory user store for demonstration
let users = [];

// --- Routes ---

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }
    if (users.some(u => u.username === username)) {
        return res.status(409).json({ error: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, email: email || '' });
    return res.json({ message: 'Registration successful.' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Optional: Issue JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ message: 'Login successful.', token, user: { username, email: user.email } });
});

// Example protected endpoint
app.get('/api/profile', (req, res) => {
    // In production, verify JWT here!
    res.json({ message: 'Profile endpoint works!' });
});

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stemfantasy.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
