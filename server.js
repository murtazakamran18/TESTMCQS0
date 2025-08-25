const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/teacher.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacher.html'));
});

app.get('/student.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'student.html'));
});

// Mock API endpoints for development
app.post('/api/add-question', (req, res) => {
  res.json({ success: true, message: 'Question added (mock)' });
});

app.get('/api/get-questions-full', (req, res) => {
  res.json({ success: true, questions: [] });
});

app.post('/api/save-result', (req, res) => {
  res.json({ success: true, message: 'Result saved (mock)' });
});

app.post('/api/edit-question', (req, res) => {
  res.json({ success: true, message: 'Question updated (mock)' });
});

app.post('/api/delete-question', (req, res) => {
  res.json({ success: true, message: 'Question deleted (mock)' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});