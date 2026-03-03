import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { verificationCodes, owners, claws, reports } from "../../db/schema.js";
import { getEnv } from "../../config.js";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendVerificationEmail(email: string, purpose: string) {
  const db = getDb();
  const env = getEnv();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationCodes).values({
    email,
    code,
    purpose,
    expiresAt,
  });

  if (env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: "ClawReport <noreply@clawreport.club>",
      to: email,
      subject: `Your ClawReport verification code: ${code}`,
      html: `
        <div style="font-family:monospace;background:#0D1117;color:#E6EDF3;padding:40px;border-radius:8px">
          <h2 style="color:#FF6B35">ClawReport Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size:32px;font-weight:bold;color:#FF6B35;letter-spacing:8px;margin:20px 0">${code}</div>
          <p style="color:#6E7681">This code expires in 10 minutes.</p>
        </div>
      `,
    });
  } else {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
  }

  return { success: true };
}

export async function verifyCodeAndLogin(email: string, code: string) {
  const db = getDb();
  const env = getEnv();

  const [verification] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.code, code),
        eq(verificationCodes.purpose, "login"),
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
    return { error: "No account found for this email. Claim a Claw first." };
  }

  const token = jwt.sign({ sub: owner.id, email: owner.email }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

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
