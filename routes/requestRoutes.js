import express from 'express';
import {
    createRequest,
    getMyRequests,
    getPendingRequests,
    getAllRequests,
    approveRequest,
    rejectRequest,
    getRequestById
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (require authentication)

// CREATOR routes
router.post('/', protect, authorize('CREATOR'), createRequest);
router.get('/my-requests', protect, authorize('CREATOR'), getMyRequests);

// APPROVER routes
router.get('/pending', protect, authorize('APPROVER'), getPendingRequests);
router.get('/', protect, authorize('APPROVER'), getAllRequests);
router.put('/:id/approve', protect, authorize('APPROVER'), approveRequest);
router.put('/:id/reject', protect, authorize('APPROVER'), rejectRequest);

// Shared route (both roles can view specific request)
router.get('/:id', protect, getRequestById);

export default router;
