// backend/utils/verifyShopifyHmac.ts
import crypto from "crypto";

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

/**
 * Verifies Shopify webhook HMAC signature
 */
export function verifyShopifyHmac(rawBody: Buffer, hmacHeader: string): boolean {
  const generated = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(rawBody.toString("utf8"), "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(hmacHeader));
}
