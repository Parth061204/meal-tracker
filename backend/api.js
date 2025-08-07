const express = require('express');
const cors = require('cors');
const path = require('path');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔐 Basic Auth Middleware for /rate page
app.use('/rate', basicAuth({
  users: { 'admin': '1234' }, // Change this!
  challenge: true
}));

// 🧾 Serve index-rate.html from /rate
app.get('/rate', (req, res) => {
  res.sendFile(path.join(__dirname, '../index-rate.html'));
});

// 🍱 In-memory meal storage
let mealLogs = [];

// ➕ Add a new meal
app.post('/entry', (req, res) => {
  const entry = {
    ...req.body,
    id: Date.now(),
    hearts: 0
  };
  mealLogs.push(entry);
  res.status(201).json(entry);
});

// 📥 Get all meals
app.get('/entries', (req, res) => {
  res.json(mealLogs);
});

// 💖 Update hearts
app.post('/rate', (req, res) => {
  const { id, hearts } = req.body;
  const entry = mealLogs.find(e => e.id === id);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  entry.hearts = hearts;
  res.json(entry);
});

// ▶️ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
