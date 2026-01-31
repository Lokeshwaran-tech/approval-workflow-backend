// Quick Database Viewer Script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Request from './models/Request.js';

dotenv.config();

const viewDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n✅ Connected to MongoDB\n');
        console.log('='.repeat(60));
        console.log('DATABASE: approval-workflow');
        console.log('='.repeat(60));

        // Get all users
        const users = await User.find().select('-password');
        console.log('\n📊 USERS COLLECTION');
        console.log('-'.repeat(60));
        console.log(`Total Users: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`User #${index + 1}:`);
            console.log(`  ID: ${user._id}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Created: ${user.createdAt}`);
            console.log('');
        });

        // Get all requests
        const requests = await Request.find().populate('creator approvedBy');
        console.log('\n📋 REQUESTS COLLECTION');
        console.log('-'.repeat(60));
        console.log(`Total Requests: ${requests.length}\n`);

        requests.forEach((request, index) => {
            console.log(`Request #${index + 1}:`);
            console.log(`  ID: ${request._id}`);
            console.log(`  Title: ${request.title}`);
            console.log(`  Description: ${request.description}`);
            console.log(`  Category: ${request.category}`);
            console.log(`  Status: ${request.status}`);
            console.log(`  Creator: ${request.creator?.name} (${request.creator?.email})`);
            if (request.approvedBy) {
                console.log(`  Approved By: ${request.approvedBy.name} (${request.approvedBy.email})`);
                console.log(`  Approval Date: ${request.approvalDate}`);
            }
            if (request.rejectionReason) {
                console.log(`  Rejection Reason: ${request.rejectionReason}`);
            }
            console.log(`  Created: ${request.createdAt}`);
            console.log(`  Updated: ${request.updatedAt}`);
            console.log('');
        });

        // Statistics
        console.log('\n📈 STATISTICS');
        console.log('-'.repeat(60));
        const creators = users.filter(u => u.role === 'CREATOR').length;
        const approvers = users.filter(u => u.role === 'APPROVER').length;
        const pending = requests.filter(r => r.status === 'PENDING').length;
        const approved = requests.filter(r => r.status === 'APPROVED').length;
        const rejected = requests.filter(r => r.status === 'REJECTED').length;

        console.log(`Total Users: ${users.length}`);
        console.log(`  - Creators: ${creators}`);
        console.log(`  - Approvers: ${approvers}`);
        console.log('');
        console.log(`Total Requests: ${requests.length}`);
        console.log(`  - Pending: ${pending}`);
        console.log(`  - Approved: ${approved}`);
        console.log(`  - Rejected: ${rejected}`);
        console.log('');
        console.log('='.repeat(60));

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

viewDatabase();
