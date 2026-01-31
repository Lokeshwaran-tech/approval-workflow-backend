import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

// Load environment variables
dotenv.config();

// Configure DNS to use Google DNS servers (fixes corporate DNS blocking MongoDB Atlas)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
console.log('🔧 DNS configured to use Google DNS servers');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Approval Workflow Management System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            requests: '/api/requests',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`\n📚 Available endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   POST   /api/requests (CREATOR)`);
    console.log(`   GET    /api/requests/my-requests (CREATOR)`);
    console.log(`   GET    /api/requests/pending (APPROVER)`);
    console.log(`   GET    /api/requests (APPROVER)`);
    console.log(`   PUT    /api/requests/:id/approve (APPROVER)`);
    console.log(`   PUT    /api/requests/:id/reject (APPROVER)`);
    console.log(`\n⚠️  Critical Business Rule: Self-approval is prevented\n`);
});
