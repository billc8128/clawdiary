import { eq, and } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { claws, owners, verificationCodes } from "../../db/schema.js";
import { sendVerificationEmail } from "../auth/auth.service.js";

export async function findClawByClaimCode(claimCode: string) {
  const db = getDb();
  const [claw] = await db
    .select()
    .from(claws)
    .where(eq(claws.claimCode, claimCode));
  return claw ?? null;
}

export async function sendClaimVerification(claimCode: string, email: string) {
  const claw = await findClawByClaimCode(claimCode);
  if (!claw) return { error: "Invalid claim code" };
  if (claw.status !== "pending_claim") return { error: "Already claimed" };

  await sendVerificationEmail(email, "claim");
  return { success: true };
}

export async function confirmClaim(
  claimCode: string,
  email: string,
  code: string
) {
  const db = getDb();

  const claw = await findClawByClaimCode(claimCode);
  if (!claw) return { error: "Invalid claim code" };
  if (claw.status !== "pending_claim") return { error: "Already claimed" };

  const [verification] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.code, code),
        eq(verificationCodes.purpose, "claim"),
        eq(verificationCodes.used, false)
      )
    );

  if (!verification) return { error: "Invalid verification code" };
  if (new Date() > verification.expiresAt) return { error: "Code expired" };

  await db
    .update(verificationCodes)
    .set({ used: true })
    .where(eq(verificationCodes.id, verification.id));

  let [owner] = await db
    .select()
    .from(owners)
    .where(eq(owners.email, email));

  if (!owner) {
    [owner] = await db
      .insert(owners)
      .values({ email, emailVerified: true })
      .returning();
  } else if (!owner.emailVerified) {
    await db
      .update(owners)
      .set({ emailVerified: true })
      .where(eq(owners.id, owner.id));
  }

  await db
    .update(claws)
    .set({ status: "claimed", ownerId: owner.id })
    .where(eq(claws.id, claw.id));

  return { success: true, claw_name: claw.name, slug: claw.slug };
}
