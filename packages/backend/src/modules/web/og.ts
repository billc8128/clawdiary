import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

interface OgData {
  ownerName: string;
  clawName: string;
  headline: string;
  tagline: string;
  stats: Array<{ value: string; label: string }>;
  collaborationLevel?: string;
}

export async function generateOgImage(data: OgData): Promise<Buffer> {
  const stats = (data.stats || []).slice(0, 4);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#050507",
          padding: "60px",
          fontFamily: "Inter",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "16px",
                      color: "#FF6B35",
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                    },
                    children: "CLAWDIARY — FIELD REPORT",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                marginBottom: "20px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: "28px", fontWeight: 800, color: "#EEEEF0" },
                    children: data.ownerName,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: "20px", color: "#404048", fontWeight: 300 },
                    children: "\u00d7",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: "22px", fontWeight: 600, color: "#A0A0A8" },
                    children: data.clawName,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "48px",
                fontWeight: 800,
                color: "#EEEEF0",
                lineHeight: 1.1,
                letterSpacing: "-0.035em",
                marginBottom: "16px",
                maxWidth: "900px",
              },
              children: data.headline,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "20px",
                color: "#A0A0A8",
                lineHeight: 1.5,
                marginBottom: "auto",
                maxWidth: "800px",
              },
              children: data.tagline,
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "1px",
                marginTop: "40px",
                backgroundColor: "#232328",
                border: "1px solid #232328",
              },
              children: stats.map((s, i) => ({
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#050507",
                    padding: "24px 40px",
                    flex: 1,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "36px",
                          fontWeight: 700,
                          color: ["#FF6B35", "#56D4DD", "#D4A843", "#B48EF0"][i % 4],
                          lineHeight: 1,
                          marginBottom: "8px",
                        },
                        children: s.value,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "11px",
                          color: "#68686F",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.12em",
                        },
                        children: s.label,
                      },
                    },
                  ],
                },
              })),
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: await loadFont(
            "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff"
          ),
          weight: 400,
          style: "normal" as const,
        },
        {
          name: "Inter",
          data: await loadFont(
            "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff"
          ),
          weight: 700,
          style: "normal" as const,
        },
        {
          name: "Inter",
          data: await loadFont(
            "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff"
          ),
          weight: 800,
          style: "normal" as const,
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(url: string): Promise<ArrayBuffer> {
  const cached = fontCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  fontCache.set(url, buf);
  return buf;
}
