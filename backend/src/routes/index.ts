import { Router } from "express";
import authRoutes from "./auth.routes";
import shopifyRoutes from "./shopify.routes";
import insightsRoutes from "./insights.routes";
import shopifyAuthRoutes from "./shopifyAuth";
import shopifyOnboardRoutes from "./shopifyOnboard";

const router = Router();

router.use("/auth", authRoutes);
router.use("/insights", insightsRoutes);
router.use("/shopify", shopifyAuthRoutes);
router.use("/shopify/onboard", shopifyOnboardRoutes);

export default router;
