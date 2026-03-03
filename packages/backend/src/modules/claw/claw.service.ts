import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { claws } from "../../db/schema.js";
import { getEnv } from "../../config.js";

function generateApiKey(): string {
  return `cr_${nanoid(32)}`;
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const suffix = nanoid(6);
  return base ? `${base}-${suffix}` : suffix;
}

function generateClaimCode(): string {
  return nanoid(16);
}

export async function registerClaw(name: string, description?: string) {
  const db = getDb();
  const env = getEnv();

  const apiKey = generateApiKey();
  const apiKeyHash = await bcrypt.hash(apiKey, 10);
  const slug = generateSlug(name);
  const claimCode = generateClaimCode();

  const [claw] = await db
    .insert(claws)
    .values({
      name,
      slug,
      apiKeyHash,
      claimCode,
      description: description ?? null,
    })
    .returning();

  return {
    api_key: apiKey,
    claw_id: claw.id,
    slug: claw.slug,
    claim_url: `${env.BASE_URL}/claim/${claimCode}`,
  };
}

export async function getClawStatus(clawId: string) {
  const db = getDb();
  const env = getEnv();

  const [claw] = await db.select().from(claws).where(eq(claws.id, clawId));
  if (!claw) return null;

  return {
    status: claw.status,
    profile_url: `${env.BASE_URL}/p/${claw.slug}`,
    claim_url:
      claw.status === "pending_claim"
        ? `${env.BASE_URL}/claim/${claw.claimCode}`
        : undefined,
  };
}
