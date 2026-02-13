import { Router } from "express";
import type { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router: Router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const secret = process.env.JWT_SECRET || "your-secret-key";
    const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = jwt.sign(
      {
        id: String(user.id),
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
      secret,
      { expiresIn } as SignOptions,
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(authReq.user!.id) },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/users", authenticateToken, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  if (authReq.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post(
  "/users",
  authenticateToken,
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;

    if (authReq.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { username, password, name, role, permissions } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and name are required",
      });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }

      const user = await prisma.user.create({
        data: {
          username,
          password,
          name,
          role: role || "user",
          permissions: permissions || [],
        },
      });

      res.json({
        success: true,
        message: "User created successfully",
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
      });
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

router.put(
  "/users/:id/permissions",
  authenticateToken,
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { permissions } = req.body;

    if (authReq.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be an array",
      });
    }

    try {
      const userId = BigInt(id as string);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { permissions: permissions as string[] },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        message: "User permissions updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update permissions error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

router.put(
  "/users/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;

    if (authReq.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    try {
      const userId = BigInt(id as string);

      const updateData: {
        name?: string;
        role?: string;
        isActive?: boolean;
        password?: string;
      } = {};

      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (password) updateData.password = password;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

router.delete(
  "/users/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (authReq.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    try {
      const userId = BigInt(id as string);

      if (authReq.user.id === id) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

export default router;
