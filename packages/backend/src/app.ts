import Fastify from "fastify";
import cors from "@fastify/cors";
import { clawRoutes } from "./modules/claw/claw.routes.js";
import { reportRoutes } from "./modules/report/report.routes.js";
import { claimRoutes } from "./modules/claim/claim.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { webRoutes } from "./modules/web/web.routes.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  await app.register(clawRoutes, { prefix: "/api/claw" });
  await app.register(reportRoutes, { prefix: "/api/report" });
  await app.register(claimRoutes, { prefix: "/api/claim" });
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(webRoutes);

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
