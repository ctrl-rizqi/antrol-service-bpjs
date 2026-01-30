import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { URL } from "url";
import { Prisma } from "@prisma/client";

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

export default prisma;
export { Prisma };
