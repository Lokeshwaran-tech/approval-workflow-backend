import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Try to use Google DNS for resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

console.log('🔧 Using custom DNS servers: 8.8.8.8, 8.8.4.4, 1.1.1.1');
console.log('🔄 Attempting to connect to MongoDB Atlas...');
console.log('');

async function testConnection() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            family: 4, // Force IPv4
        });

        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log('');
        console.log('🎉 The connection is working! You can now start the server.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.log('❌ Connection still failed:', error.message);
        console.log('');
        console.log('⚠️  The issue is likely:');
        console.log('   1. Windows Firewall blocking Node.js');
        console.log('   2. Corporate network/proxy blocking MongoDB Atlas');
        console.log('   3. Antivirus software blocking the connection');
        console.log('');
        console.log('🔧 Manual fix required:');
        console.log('   1. Open PowerShell as Administrator');
        console.log('   2. Run: New-NetFirewallRule -DisplayName "Node.js" -Direction Outbound -Program "C:\\Program Files\\nodejs\\node.exe" -Action Allow');
        console.log('   3. Or temporarily disable Windows Defender Firewall');
        console.log('');
        process.exit(1);
    }
}

testConnection();
