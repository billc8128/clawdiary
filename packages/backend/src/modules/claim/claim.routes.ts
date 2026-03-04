import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { claimClaw } from "./claim.service.js";

const claimBody = z.object({ email: z.string().email() });

export async function claimRoutes(app: FastifyInstance) {
  app.post("/:code", async (request, reply) => {
    const { code } = request.params as { code: string };
    const body = claimBody.parse(request.body);
    const result = await claimClaw(code, body.email);
    if ("error" in result) {
      return reply.status(400).send(result);
    }
    return result;
  });
}
