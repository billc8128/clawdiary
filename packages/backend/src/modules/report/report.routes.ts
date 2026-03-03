import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { syncReport } from "./report.service.js";
import { requireClawAuth } from "../auth/auth.middleware.js";

const syncBody = z.object({
  report: z.record(z.unknown()),
  activity: z.record(z.unknown()),
  meta: z.record(z.unknown()),
});

export async function reportRoutes(app: FastifyInstance) {
  app.post(
    "/sync",
    { preHandler: requireClawAuth },
    async (request, reply) => {
      const body = syncBody.parse(request.body);
      const result = await syncReport(request.claw!.id, body);
      return result;
    }
  );
}
