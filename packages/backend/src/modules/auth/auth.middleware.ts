import type { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { claws } from "../../db/schema.js";
import { getEnv } from "../../config.js";

declare module "fastify" {
  interface FastifyRequest {
    claw?: { id: string; slug: string };
    owner?: { id: string; email: string };
  }
}

export async function requireClawAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing authorization header" });
  }

  const token = authHeader.slice(7);
  if (!token.startsWith("cr_")) {
    return reply.status(401).send({ error: "Invalid API key format" });
  }

  const db = getDb();
  const allClaws = await db.select().from(claws);

  for (const claw of allClaws) {
    const match = await bcrypt.compare(token, claw.apiKeyHash);
    if (match) {
      request.claw = { id: claw.id, slug: claw.slug };
      return;
    }
  }

  return reply.status(401).send({ error: "Invalid API key" });
}

export async function requireOwnerAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing authorization header" });
  }

  const token = authHeader.slice(7);
  if (token.startsWith("cr_")) {
    return reply.status(401).send({ error: "Expected JWT, got API key" });
  }

  try {
    const env = getEnv();
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
    };
    request.owner = { id: payload.sub, email: payload.email };
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}
