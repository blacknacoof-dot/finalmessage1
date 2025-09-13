const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const mockMessages = [
  {
    id: '1',
    title: '테스트 메시지',
    content: '이것은 테스트 메시지입니다.',
    recipients: ['test@example.com'],
    deliveryDate: '2024-12-31',
    isLocked: false,
    createdAt: '2024-01-01'
  }
];

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/messages', (req, res) => {
  console.log('GET /api/messages called');
  res.json({
    success: true,
    data: mockMessages,
    total: mockMessages.length,
    page: 1,
    limit: 10
  });
});

app.post('/api/messages', (req, res) => {
  console.log('POST /api/messages called with:', req.body);
  const newMessage = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  mockMessages.push(newMessage);
  res.json({ success: true, data: newMessage });
});

app.put('/api/messages/:id', (req, res) => {
  const id = req.params.id;
  const index = mockMessages.findIndex(m => m.id === id);
  if (index !== -1) {
    mockMessages[index] = { ...mockMessages[index], ...req.body };
    res.json({ success: true, data: mockMessages[index] });
  } else {
    res.status(404).json({ success: false, error: 'Message not found' });
  }
});

app.delete('/api/messages/:id', (req, res) => {
  const id = req.params.id;
  const index = mockMessages.findIndex(m => m.id === id);
  if (index !== -1) {
    mockMessages.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Message not found' });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Mock Backend Server running on http://localhost:${PORT}`);
  console.log('Ready to handle API requests!');
});

// Keep alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});