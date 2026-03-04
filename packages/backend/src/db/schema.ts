import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const claws = pgTable("claws", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  apiKeyHash: text("api_key_hash").notNull(),
  claimCode: text("claim_code").notNull().unique(),
  status: text("status").notNull().default("pending_claim"),
  ownerId: uuid("owner_id").references(() => owners.id),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const owners = pgTable("owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  clawId: uuid("claw_id")
    .notNull()
    .references(() => claws.id),
  reportJson: jsonb("report_json").notNull(),
  activityJson: jsonb("activity_json").notNull(),
  metaJson: jsonb("meta_json").notNull(),
  isCurrent: boolean("is_current").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
