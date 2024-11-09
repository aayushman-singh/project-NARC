const express = require("express");

const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');

const connectDB = require('./config/db');


dotenv.config();

connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);


// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// For Vercel deployment
module.exports = app;
