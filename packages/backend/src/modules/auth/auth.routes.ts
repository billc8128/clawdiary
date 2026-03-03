import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  sendVerificationEmail,
  verifyCodeAndLogin,
  getOwnerProfile,
} from "./auth.service.js";
import { requireOwnerAuth } from "./auth.middleware.js";

const emailBody = z.object({ email: z.string().email() });
const verifyBody = z.object({ email: z.string().email(), code: z.string() });

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const body = emailBody.parse(request.body);
    const result = await sendVerificationEmail(body.email, "login");
    return result;
  });

  app.post("/login/verify", async (request, reply) => {
    const body = verifyBody.parse(request.body);
    const result = await verifyCodeAndLogin(body.email, body.code);
    if ("error" in result) {
      return reply.status(400).send(result);
    }
    return result;
  });

  app.get(
    "/owner/me",
    { preHandler: requireOwnerAuth },
    async (request, reply) => {
      const profile = await getOwnerProfile(request.owner!.id);
      if (!profile) {
        return reply.status(404).send({ error: "Owner not found" });
      }
      return profile;
    }
  );
}
