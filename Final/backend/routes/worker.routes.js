// routes/worker.routes.js
import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRole.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validate, applyRules } from "../middleware/validate.js";
import {
  applyToJob,
  getWorkerDashboard,
  getWorkerNotifications,
  updateWorkerAvailability,
  getWorkerAvailability,
  getWorkerJobs,
  getWorkerJobDetails,
  getWorkerApplicationDetails,
  
} from "../controller/worker.controller.js";

// APPLY to a job
router.post(
  "/jobs/:jobId/apply",
  authMiddleware,
  authorizeRole("worker"),
  validate(applyRules),
  asyncHandler(applyToJob)
);

// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRole("worker"),
  asyncHandler(getWorkerDashboard)
);

// Notifications
router.get(
  "/notifications",
  authMiddleware,
  authorizeRole("worker"),
  asyncHandler(getWorkerNotifications)
);



// Availability
router.put(
  "/:workerId/availability",
  authMiddleware,
  authorizeRole("worker"),
  asyncHandler(updateWorkerAvailability)
);

router.get(
  "/:workerId/availability",
  asyncHandler(getWorkerAvailability)
);


// Get all available jobs for workers to browse
router.get(
  "/jobs",
  authMiddleware,
  authorizeRole("worker"),
  asyncHandler(getWorkerJobs)
);

// Get job details for worker
router.get(
  "/jobs/:jobId",
  authMiddleware,
  authorizeRole("worker"),
  asyncHandler(getWorkerJobDetails)
);

// Get application details for worker
router.get(
  "/applications/:applicationId",
  authMiddleware,
  authorizeRole("worker"),
  asyncHandler(getWorkerApplicationDetails)
);



export default router;