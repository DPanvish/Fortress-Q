import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
await connectDB();

// Routes
app.get("/", (req, res) => {
    res.send("Fortress Q API is Running. Quantum Security Active.")
});
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})