import { Router } from "express";
import authRoutes from "./auth.routes";
import shopifyRoutes from "./shopify.routes";
import insightsRoutes from "./insights.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/shopify", shopifyRoutes);
router.use("/insights", insightsRoutes);

export default router;
