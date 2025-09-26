import { Router } from "express";
import { prisma } from "../lib/prisma";

export const templatesRouter = Router();

// GET /templates?tenant_id=1
templatesRouter.get("/", async (req, res) => {
  const tenantId = BigInt(req.query.tenant_id as string);
  const rows = await prisma.template.findMany({
    where: { tenant_id: tenantId },
    orderBy: { created_at: "desc" },
  });
  res.json(rows);
});

// POST /templates
templatesRouter.post("/", async (req, res) => {
  const { tenant_id, channel, name, body, variables, approved, category } = req.body;
  const t = await prisma.template.create({
    data: {
      tenant_id: BigInt(tenant_id),
      channel,
      name,
      body,
      variables,
      approved: !!approved,
      category,
    },
  });
  res.status(201).json(t);
});
