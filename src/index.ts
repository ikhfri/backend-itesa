import app from "./app";
import { VercelRequest, VercelResponse } from "@vercel/node";

app.get("/", (req, res) => {
  res.json({ message: "API is up and running" });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
