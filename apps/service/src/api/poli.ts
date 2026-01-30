// Admin controller berisikan logika untuk mengelola data admin
import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { paginate } from "../utils/pagination";

const router: Router = Router();

// Pengecualian Poli
// Menambahkan daftar poli yang tidak perlu diproses
router.post("/exception", async (req: Request, res: Response) => {
  // Array
  const { poli_id } = (req.body || {}) as {
    poli_id: { poli_id: string; poli_nama: string }[];
  };

  if (!Array.isArray(poli_id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid poli_id format. Must be an array of strings.",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Reset data pengecualian lama
      await tx.poliException.deleteMany({});

      // Masukkan data baru
      if (poli_id.length > 0) {
        await tx.poliException.createMany({
          data: poli_id.map((id) => ({
            poli_id: id.poli_id,
            nama_poli: id.poli_nama,
          })),
        });
      }
    });

    console.log(
      `[ADMIN] Updated exception poli_id list: ${poli_id.join(", ")}`,
    );

    res.json({
      success: true,
      message: "Successfully updated poli exceptions.",
      data: poli_id,
    });
  } catch (error) {
    console.error("Failed to update exception poli_id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update exception poli_id",
      error: (error as Error).message,
    });
  }
});

// Menampilkan daftar pengecualian poli
router.get("/exception", async (req: Request, res: Response) => {
  try {
    const poliExceptions = await paginate(prisma.poliException, req, {
      orderBy: {
        poli_id: "asc",
      },
    });

    res.json({
      success: true,
      ...poliExceptions,
    });
  } catch (error) {
    console.error("Failed to fetch exception poli_id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exception poli_id",
      error: (error as Error).message,
    });
  }
});

export default router;
