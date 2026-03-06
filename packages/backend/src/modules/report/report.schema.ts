import { z } from "zod";

const heroStatsSchema = z.object({
  ownerName: z.string().optional(),
  clawName: z.string().optional(),
  headline: z.string().optional(),
  tagline: z.string().optional(),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
});

const identityCardSchema = z.object({
  role: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  career: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  goal: z.string().optional(),
});

const showcaseItemSchema = z.object({
  title: z.string(),
  what: z.string(),
  soWhat: z.string(),
  evidence: z.string().optional(),
  domain: z.string().optional(),
  impactLevel: z.string().optional(),
});

const ownerPortraitSchema = z.object({
  thinkingStyle: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  tasteAnchor: z
    .object({
      names: z.array(z.string()).optional(),
      reason: z.string().optional(),
      contrast: z.string().optional(),
    })
    .optional(),
  collaborationLevel: z
    .object({
      level: z.string().optional(),
      label: z.string().optional(),
      evidence: z.string().optional(),
    })
    .optional(),
  dimensions: z
    .array(
      z.object({
        type: z.string().optional(),
        label: z.string(),
        observation: z.string(),
        evidence: z.string().optional(),
        metric: z.string().optional(),
        clawComment: z.string().optional(),
      }),
    )
    .optional(),
});

const catchphraseSchema = z.object({
  phrase: z.string(),
  frequency: z.number(),
  vibe: z.string().optional(),
  clawInterpretation: z.string(),
});

const diaryEntrySchema = z.object({
  date: z.string(),
  type: z.string().optional(),
  title: z.string(),
  entry: z.string(),
});

const achievementSchema = z.object({
  tier: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

const letterSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    signoff: z.string().optional(),
  }),
]);

const autonomousRoutineSchema = z.object({
  name: z.string(),
  schedule: z.string().optional(),
  description: z.string(),
});

const skillFootprintSchema = z.object({
  featured: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  tools: z
    .array(
      z.object({
        name: z.string(),
        icon: z.string().optional(),
        count: z.number().optional(),
        highlight: z.string().optional(),
      }),
    )
    .optional(),
});

export const reportJsonSchema = z.object({
  heroStats: heroStatsSchema,
  effortMap: z.object({
    commentary: z.string().optional(),
    highlight: z.string().optional(),
  }),
  showcase: z.array(showcaseItemSchema).min(1),
  ownerPortrait: ownerPortraitSchema,
  catchphrases: z.array(catchphraseSchema).min(1),
  diary: z.array(diaryEntrySchema).min(1),
  achievements: z.array(achievementSchema).min(1),
  letterToOwner: letterSchema,
  identityCard: identityCardSchema.optional(),
  autonomousRoutines: z.array(autonomousRoutineSchema).optional(),
  skillFootprint: skillFootprintSchema.optional(),
  topDomains: z.array(z.string()).optional(),
});

export type ReportJson = z.infer<typeof reportJsonSchema>;
