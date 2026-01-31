import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

dotenv.config();

const resolveSrv = promisify(dns.resolveSrv);

async function testDNS() {
    try {
        console.log('Testing DNS SRV resolution...');
        const records = await resolveSrv('_mongodb._tcp.fsd17.ib00v6i.mongodb.net');
        console.log('✅ SRV Records found:', records.length);
        records.forEach((record, i) => {
            console.log(`   ${i + 1}. ${record.name}:${record.port} (priority: ${record.priority})`);
        });
        return true;
    } catch (error) {
        console.log('❌ DNS SRV Resolution failed:', error.message);
        return false;
    }
}

async function testConnection() {
    console.log('='.repeat(60));
    console.log('MongoDB Atlas Connection Test');
    console.log('='.repeat(60));
    console.log('');

    // Test DNS first
    const dnsWorks = await testDNS();
    console.log('');

    if (!dnsWorks) {
        console.log('⚠️  DNS SRV lookup failed. This is a common issue on Windows.');
        console.log('💡 Possible solutions:');
        console.log('   1. Try using a different DNS server (e.g., Google DNS: 8.8.8.8)');
        console.log('   2. Disable antivirus/firewall temporarily');
        console.log('   3. Use a direct connection string instead of SRV');
        console.log('');
    }

    try {
        console.log('Attempting MongoDB connection...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.log('❌ Connection failed:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('');
            console.log('🔍 ECONNREFUSED Error Analysis:');
            console.log('   This error means the connection was actively refused.');
            console.log('');
            console.log('💡 Common causes:');
            console.log('   1. Firewall/Antivirus blocking MongoDB connections');
            console.log('   2. Corporate network blocking outbound connections');
            console.log('   3. VPN interfering with DNS resolution');
            console.log('   4. Windows Defender Firewall blocking Node.js');
            console.log('');
            console.log('🔧 Try these solutions:');
            console.log('   1. Temporarily disable Windows Defender Firewall');
            console.log('   2. Add Node.js to firewall exceptions');
            console.log('   3. Try connecting from a different network (mobile hotspot)');
            console.log('   4. Check if you\'re behind a corporate proxy');
        }

        process.exit(1);
    }
}

testConnection();
