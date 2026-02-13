import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { URL } from "url";

const databaseUrl = process.env.DATABASE_URL || "";
const url = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: url.hostname || "localhost",
  port: url.port ? parseInt(url.port) : 3306,
  user: url.username || "root",
  password: url.password || "",
  database: url.pathname.slice(1) || "prisma",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "admin",
      permissions: ["*"],
      isActive: true,
    },
  });

  console.log("Created admin user:", adminUser.username);

  const regularUser = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      password: "user123",
      name: "Regular User",
      role: "user",
      permissions: [
        "poli:access",
        "category:access",
      ],
      isActive: true,
    },
  });

  console.log("Created regular user:", regularUser.username);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
