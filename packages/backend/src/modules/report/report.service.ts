import { eq, and } from "drizzle-orm";
import { getDb } from "../../db/connection.js";
import { reports, claws } from "../../db/schema.js";
import { getEnv } from "../../config.js";

export async function syncReport(
  clawId: string,
  data: { report: unknown; activity: unknown; meta: unknown }
) {
  const db = getDb();
  const env = getEnv();

  await db
    .update(reports)
    .set({ isCurrent: false } as Partial<typeof reports.$inferInsert>)
    .where(and(eq(reports.clawId, clawId), eq(reports.isCurrent, true)));

  const [report] = await db
    .insert(reports)
    .values({
      clawId,
      reportJson: data.report,
      activityJson: data.activity,
      metaJson: data.meta,
    })
    .returning();

  const [claw] = await db.select().from(claws).where(eq(claws.id, clawId));

  return {
    report_id: report.id,
    url: `${env.BASE_URL}/p/${claw.slug}`,
  };
}

export async function getCurrentReport(clawId: string) {
  const db = getDb();
  const [report] = await db
    .select()
    .from(reports)
    .where(and(eq(reports.clawId, clawId), eq(reports.isCurrent, true)));
  return report ?? null;
}

export async function getReportBySlug(slug: string) {
  const db = getDb();
  const [claw] = await db.select().from(claws).where(eq(claws.slug, slug));
  if (!claw) return null;

  const report = await getCurrentReport(claw.id);
  if (!report) return null;

  return { claw, report };
}
