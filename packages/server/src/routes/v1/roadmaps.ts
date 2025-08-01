import express from "express";
import { z } from "zod";
import rateLimit from 'express-rate-limit';
const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";
import * as middleware from "../../middlewares";
import { roadmapExists } from "../../middlewares/roadmapExists";

// Rate limiter for pagination endpoint
const paginationRateLimit = rateLimit({
  windowMs: 15 * 1000,        // 15 seconds window
  max: 10,                    // 10 requests per window
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many pagination requests. Try again later.'
  },
  standardHeaders: true,      // Return rate limit info in headers
  legacyHeaders: false,
});

// Validator helper
const querySchema = z.object({
  first: z.coerce.number().min(1).max(100).default(20),
  after: z.string().uuid().optional()
});

// Helper function for validation
const validateQuery = (schema: z.ZodSchema) => (req, res, next) => {
  try {
    res.locals.query = schema.parse(req.query);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};

router.get(
  "/roadmaps",
  paginationRateLimit,
  validateQuery(querySchema),
  roadmaps.filter
);

router.get("/roadmaps/:url", roadmapExists, roadmaps.roadmapByUrl);
router.get(
  "/roadmaps/search/:name",
  middleware.apiAuth,
  roadmaps.searchRoadmap
);

export default router;
