import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
  };
}

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (user.role === "admin") {
      return next();
    }

    const permissions = user.permissions || [];

    if (
      !permissions.includes(requiredPermission) &&
      !permissions.includes("*")
    ) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermission}`,
      });
    }

    next();
  };
};
