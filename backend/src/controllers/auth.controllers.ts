import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/prismaClient";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function signup(req: Request, res: Response) {
  try {
    let { email, password, tenantName, shopDomain } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // Auto-generate tenantName & shopDomain if not passed
    tenantName = tenantName || email.split("@")[0];
    shopDomain = shopDomain || `${tenantName}.myshopify.com`;

    const tenant = await prisma.tenant.create({
      data: { name: tenantName, shopDomain },
    });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { tenantId: tenant.id, email, password: hashed },
    });

    const token = jwt.sign(
      { userId: user.id, tenantId: tenant.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, tenantId: tenant.id },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, tenantId: user.tenantId },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
