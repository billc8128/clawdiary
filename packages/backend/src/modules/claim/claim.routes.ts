import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  sendClaimVerification,
  confirmClaim,
  findClawByClaimCode,
} from "./claim.service.js";

const verifyBody = z.object({ email: z.string().email() });
const confirmBody = z.object({ email: z.string().email(), code: z.string() });

export async function claimRoutes(app: FastifyInstance) {
  app.post("/:code/verify", async (request, reply) => {
    const { code } = request.params as { code: string };
    const body = verifyBody.parse(request.body);
    const result = await sendClaimVerification(code, body.email);
    if ("error" in result) {
      return reply.status(400).send(result);
    }
    return result;
  });

  app.post("/:code/confirm", async (request, reply) => {
    const { code } = request.params as { code: string };
    const body = confirmBody.parse(request.body);
    const result = await confirmClaim(code, body.email, body.code);
    if ("error" in result) {
      return reply.status(400).send(result);
    }
    return result;
  });
}
