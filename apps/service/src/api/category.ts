import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { paginate } from "../utils/pagination";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const paginatedCategories = await paginate(prisma.category, req, {
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      ...paginatedCategories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: (error as Error).message,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };

  try {
    const newCategory = await prisma.category.create({
      data: { name },
    });
    res.json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Failed to create category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: (error as Error).message,
    });
  }
});

router.patch("/update/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name } = req.body as { name: string };

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: (error as Error).message,
    });
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  try {
    const deletedCategory = await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: (error as Error).message,
    });
  }
});

export default router;
