import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
};

start();
