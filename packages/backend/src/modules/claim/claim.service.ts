import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { claws, owners } from "../../db/schema.js";
import { getEnv } from "../../config.js";

export async function findClawByClaimCode(claimCode: string) {
  const db = getDb();
  const [claw] = await db
    .select()
    .from(claws)
    .where(eq(claws.claimCode, claimCode));
  return claw ?? null;
}

export async function claimClaw(claimCode: string, email: string) {
  const db = getDb();
  const env = getEnv();

  const claw = await findClawByClaimCode(claimCode);
  if (!claw) return { error: "Invalid claim code" };
  if (claw.status !== "pending_claim") return { error: "Already claimed" };

  let [owner] = await db
    .select()
    .from(owners)
    .where(eq(owners.email, email));

  if (!owner) {
    [owner] = await db.insert(owners).values({ email }).returning();
  }

  await db
    .update(claws)
    .set({ status: "claimed", ownerId: owner.id } as Partial<typeof claws.$inferInsert>)
    .where(eq(claws.id, claw.id));

  const token = jwt.sign(
    { sub: owner.id, email: owner.email },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return {
    success: true,
    token,
    claw_name: claw.name,
    slug: claw.slug,
  };
}
