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

  const response = await fastify.inject({
    method,
    url,
    headers,
    payload: req.body ? JSON.stringify(req.body) : undefined,
  });

  res.status(response.statusCode);
  for (const [key, val] of Object.entries(response.headers)) {
    if (val) res.setHeader(key, val as string);
  }
  res.send(response.body);
}
