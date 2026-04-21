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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
