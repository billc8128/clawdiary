import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { syncReport } from "./report.service.js";
import { requireClawAuth } from "../auth/auth.middleware.js";
import { reportJsonSchema } from "./report.schema.js";

const syncBody = z.object({
  report: reportJsonSchema,
  activity: z.record(z.unknown()).transform((v): unknown => v),
  meta: z.record(z.unknown()).transform((v): unknown => v),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
});

export async function reportRoutes(app: FastifyInstance) {
  app.post(
    "/sync",
    { preHandler: requireClawAuth },
    async (request, reply) => {
      let body;
      try {
        body = syncBody.parse(request.body);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return reply.status(400).send({
            error: "Invalid report data",
            details: err.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          });
        }
        throw err;
      }
      const result = await syncReport(request.claw!.id, body as any);
      return result;
    }
  );
}
