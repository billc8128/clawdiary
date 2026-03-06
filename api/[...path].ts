import type { VercelRequest, VercelResponse } from "@vercel/node";

let app: any;

async function getApp() {
  if (!app) {
    const { buildApp } = await import("../packages/backend/src/app.js");
    app = await buildApp();
    await app.ready();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getApp();

  const url = req.url || "/";
  const method = req.method || "GET";
  const headers: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === "string") headers[key] = val;
    else if (Array.isArray(val)) headers[key] = val.join(", ");
  }

  // Vercel auto-parses JSON bodies, so re-serialize and fix content-length
  let payload: string | undefined;
  if (req.body != null) {
    payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    headers["content-length"] = Buffer.byteLength(payload).toString();
  } else {
    delete headers["content-length"];
  }

  const response = await fastify.inject({
    method,
    url,
    headers,
    payload,
  });

  res.status(response.statusCode);
  for (const [key, val] of Object.entries(response.headers)) {
    if (val) res.setHeader(key, val as string);
  }
  res.send(response.body);
}
