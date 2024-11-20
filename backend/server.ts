import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// For Vercel deployment
export default app;
