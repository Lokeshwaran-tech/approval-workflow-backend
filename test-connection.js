import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('='.repeat(60));
console.log('MongoDB Connection Diagnostic Tool');
console.log('='.repeat(60));
console.log('');

const testConnection = async () => {
    try {
        console.log('📋 Configuration:');
        console.log(`   MongoDB URI: ${process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}`);
        console.log(`   Node Environment: ${process.env.NODE_ENV}`);
        console.log('');

        console.log('🔄 Attempting connection...');
        console.log('   (This may take up to 10 seconds)');
        console.log('');

        const startTime = Date.now();

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('✅ SUCCESS! MongoDB Connected');
        console.log('');
        console.log('📊 Connection Details:');
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Connection State: ${conn.connection.readyState} (1 = connected)`);
        console.log(`   Connection Time: ${duration}s`);
        console.log('');

        // Test a simple operation
        console.log('🧪 Testing database operation...');
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`   Found ${collections.length} collection(s)`);
        if (collections.length > 0) {
            console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
        }
        console.log('');

        console.log('✅ All tests passed! Your MongoDB Atlas connection is working.');
        console.log('='.repeat(60));

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.log('❌ CONNECTION FAILED');
        console.log('');
        console.log('📋 Error Details:');
        console.log(`   Message: ${error.message}`);
        console.log(`   Name: ${error.name}`);
        console.log('');

        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('💡 DNS Resolution Error:');
            console.log('   - Check your internet connection');
            console.log('   - Verify the MongoDB Atlas cluster URL is correct');
            console.log('   - Try disabling VPN if you\'re using one');
        } else if (error.message.includes('authentication failed')) {
            console.log('💡 Authentication Error:');
            console.log('   - Verify your MongoDB username and password');
            console.log('   - Check if the user has proper permissions');
        } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.log('💡 Network Access Error:');
            console.log('   - Add your IP address to MongoDB Atlas Network Access');
            console.log('   - Or allow access from anywhere (0.0.0.0/0) for testing');
        } else if (error.message.includes('timeout')) {
            console.log('💡 Timeout Error:');
            console.log('   - Check your firewall settings');
            console.log('   - Verify MongoDB Atlas cluster is running');
            console.log('   - Check if your network blocks MongoDB ports');
        }

        console.log('');
        console.log('='.repeat(60));
        process.exit(1);
    }
};

testConnection();
