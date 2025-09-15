import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export interface TenantRequest extends AuthRequest {
  tenantId?: number;
}

export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  const header = req.headers["x-tenant-id"];
  if (header) {
    const tenantId = parseInt(String(header), 10);
    if (!isNaN(tenantId)) {
      req.tenantId = tenantId;
      return next();
    }
    return res.status(400).json({ message: "Invalid x-tenant-id header" });
  }

  // fallback to JWT tenantId if available
  if (req.user?.tenantId) {
    req.tenantId = req.user.tenantId;
  }

  next();
}
