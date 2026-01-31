import Request from '../models/Request.js';
import mongoose from 'mongoose';

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (CREATOR only)
export const createRequest = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        // Validate input
        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (title, description, category)'
            });
        }

        // Create request
        const request = await Request.create({
            title,
            description,
            category,
            creator: req.user.id
        });

        // Populate creator details
        await request.populate('creator', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: request
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating request',
            error: error.message
        });
    }
};

// @desc    Get all requests for creator (own requests)
// @route   GET /api/requests/my-requests
// @access  Private (CREATOR only)
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ creator: req.user.id })
            .populate('creator', 'name email role')
            .populate('approvedBy', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get my requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching requests',
            error: error.message
        });
    }
};

// @desc    Get all pending requests for approver
// @route   GET /api/requests/pending
// @access  Private (APPROVER only)
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'PENDING' })
            .populate('creator', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending requests',
            error: error.message
        });
    }
};

// @desc    Get all requests (for approver to see history)
// @route   GET /api/requests
// @access  Private (APPROVER only)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('creator', 'name email role')
            .populate('approvedBy', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching requests',
            error: error.message
        });
    }
};

// @desc    Approve a request
// @route   PUT /api/requests/:id/approve
// @access  Private (APPROVER only)
export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        // Find the request
        const request = await Request.findById(id).populate('creator', 'name email role');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check if request is already processed
        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Request has already been ${request.status.toLowerCase()}`
            });
        }

        // ⚠️ CRITICAL BUSINESS RULE: Prevent self-approval
        if (request.creator._id.toString() === req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You cannot approve your own request. Self-approval is not allowed.'
            });
        }

        // Update request status
        request.status = 'APPROVED';
        request.approvedBy = req.user.id;
        request.approvalDate = new Date();
        await request.save();

        // Populate approver details
        await request.populate('approvedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data: request
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving request',
            error: error.message
        });
    }
};

// @desc    Reject a request
// @route   PUT /api/requests/:id/reject
// @access  Private (APPROVER only)
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        // Find the request
        const request = await Request.findById(id).populate('creator', 'name email role');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check if request is already processed
        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Request has already been ${request.status.toLowerCase()}`
            });
        }

        // ⚠️ CRITICAL BUSINESS RULE: Prevent self-rejection (same logic as approval)
        if (request.creator._id.toString() === req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You cannot reject your own request. Self-rejection is not allowed.'
            });
        }

        // Update request status
        request.status = 'REJECTED';
        request.approvedBy = req.user.id;
        request.approvalDate = new Date();
        request.rejectionReason = reason || 'No reason provided';
        await request.save();

        // Populate approver details
        await request.populate('approvedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data: request
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting request',
            error: error.message
        });
    }
};

// @desc    Get single request details
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID'
            });
        }

        const request = await Request.findById(id)
            .populate('creator', 'name email role')
            .populate('approvedBy', 'name email role');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get request by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching request',
            error: error.message
        });
    }
};
