import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { registerClaw, getClawStatus } from "./claw.service.js";
import { requireClawAuth } from "../auth/auth.middleware.js";

const registerBody = z.object({
  name: z.string().min(1).max(64),
  description: z.string().max(500).optional(),
});

export async function clawRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const body = registerBody.parse(request.body);
    const result = await registerClaw(body.name, body.description);
    return reply.status(201).send(result);
  });

  app.get(
    "/status",
    { preHandler: requireClawAuth },
    async (request, reply) => {
      const status = await getClawStatus(request.claw!.id);
      if (!status) {
        return reply.status(404).send({ error: "Claw not found" });
      }
      return status;
    }
  );
}
