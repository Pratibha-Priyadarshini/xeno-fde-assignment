import { Request, Response, NextFunction } from "express";

/**
 * Expects a tenant-id either in header 'x-tenant-id' or in JWT (req.user)
 * Attaches req.tenantId
 */
export interface TenantRequest extends Request {
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

  // else, allow route to continue (some routes will read from JWT instead)
  next();
}
