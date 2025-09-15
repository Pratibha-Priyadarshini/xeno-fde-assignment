import { Router } from "express";
import * as InsightsController from "../controllers/insights.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { tenantMiddleware } from "../middlewares/tenant.middleware";

const router = Router();

// Apply JWT auth + tenant middleware for all insights endpoints
router.use(authenticateJWT, tenantMiddleware);

// GET /insights/summary?tenantId=...
router.get("/summary", InsightsController.summary);

// GET /insights/orders?tenantId=...&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/orders", InsightsController.ordersTimeseries);

// GET /insights/top-customers?tenantId=...&limit=5
router.get("/top-customers", InsightsController.topCustomers);

export default router;
