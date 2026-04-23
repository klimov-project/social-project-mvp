import 'dotenv/config'
import express, { json } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

console.log('Initializing Express app...');

app.use(cors());
app.use(json());

app.use('/api', authRoutes, userRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    if (err.message) {
        if (err.message.includes('must be') || err.message.includes('Invalid') || err.message.includes('already exists')) {
            return res.status(400).json({ message: err.message });
        }
    }
    res.status(500).json({ message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
