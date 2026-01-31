import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['Leave', 'Purchase', 'Budget', 'Other']
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvalDate: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
requestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
