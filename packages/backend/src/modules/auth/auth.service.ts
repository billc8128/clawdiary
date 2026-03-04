import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { owners, claws, reports } from "../../db/schema.js";
import { getEnv } from "../../config.js";

export async function loginByEmail(email: string) {
  const db = getDb();
  const env = getEnv();

  const [owner] = await db
    .select()
    .from(owners)
    .where(eq(owners.email, email));

  if (!owner) {
    return { error: "No account found for this email. Claim a Claw first." };
  }

  const token = jwt.sign(
    { sub: owner.id, email: owner.email },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return { token, owner: { id: owner.id, email: owner.email } };
}

export async function getOwnerProfile(ownerId: string) {
  const db = getDb();

  const [owner] = await db
    .select()
    .from(owners)
    .where(eq(owners.id, ownerId));
  if (!owner) return null;

  const ownerClaws = await db
    .select()
    .from(claws)
    .where(eq(claws.ownerId, ownerId));

  const clawsWithReports = await Promise.all(
    ownerClaws.map(async (claw) => {
      const [report] = await db
        .select()
        .from(reports)
        .where(and(eq(reports.clawId, claw.id), eq(reports.isCurrent, true)));

      return {
        id: claw.id,
        name: claw.name,
        slug: claw.slug,
        status: claw.status,
        description: claw.description,
        has_report: !!report,
        created_at: claw.createdAt,
      };
    })
  );

  return {
    id: owner.id,
    email: owner.email,
    claws: clawsWithReports,
  };
}
