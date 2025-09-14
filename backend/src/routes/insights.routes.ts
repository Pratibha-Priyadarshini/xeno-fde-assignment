import { Router } from "express";
import * as InsightsController from "../controllers/insights.controllers";

const router = Router();

router.get("/summary", InsightsController.summary);
router.get("/orders", InsightsController.ordersTimeseries);
router.get("/top-customers", InsightsController.topCustomers);

export default router;
