import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const log = [];
const addLog = (message) => {
    console.log(message);
    log.push(message);
};

const testConnection = async () => {
    try {
        addLog('Testing MongoDB Connection...');
        addLog(`URI: ${process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}`);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        addLog('SUCCESS: Connected to MongoDB');
        addLog(`Host: ${conn.connection.host}`);
        addLog(`Database: ${conn.connection.name}`);

        fs.writeFileSync('connection-test.json', JSON.stringify({
            success: true,
            host: conn.connection.host,
            database: conn.connection.name,
            log: log
        }, null, 2));

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        addLog('FAILED: ' + error.message);
        addLog('Error Name: ' + error.name);

        fs.writeFileSync('connection-test.json', JSON.stringify({
            success: false,
            error: error.message,
            errorName: error.name,
            errorStack: error.stack,
            log: log
        }, null, 2));

        process.exit(1);
    }
};

testConnection();
