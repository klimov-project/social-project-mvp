const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

console.log('Initializing Express app...');

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
