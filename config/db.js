import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('🔄 Attempting to connect to MongoDB Atlas...');
        console.log(`📍 Connection URI: ${process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}`);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🔌 Connection State: ${conn.connection.readyState}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('📋 Full error:', error);
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check if your IP address is whitelisted in MongoDB Atlas');
        console.error('   2. Verify your MongoDB credentials are correct');
        console.error('   3. Ensure your network allows outbound connections to MongoDB Atlas');
        process.exit(1);
    }
};

export default connectDB;
