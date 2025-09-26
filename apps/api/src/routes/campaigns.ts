import { Router } from "express";
import { prisma } from "../lib/prisma";
import { enqueueCampaignTargets } from "../services/campaigns";

export const campaignsRouter = Router();

// GET /campaigns?tenant_id=1
campaignsRouter.get("/", async (req, res) => {
  const tenantId = BigInt(req.query.tenant_id as string);
  const list = await prisma.campaigns.findMany({ // nome conforme introspecção
    where: { tenant_id: tenantId as any },
    orderBy: { created_at: "desc" },
  });
  res.json(list);
});

// POST /campaigns
campaignsRouter.post("/", async (req, res) => {
  const { tenant_id, name, channel, template_id, schedule_at } = req.body;
  const row = await prisma.campaigns.create({
    data: {
      tenant_id: BigInt(tenant_id) as any,
      name,
      channel,
      template_id: template_id ? (BigInt(template_id) as any) : null,
      schedule_at: schedule_at ? new Date(schedule_at) : null,
      status: "draft",
    },
  });
  res.status(201).json(row);
});

// POST /campaigns/:id/enqueue
campaignsRouter.post("/:id/enqueue", async (req, res) => {
  const id = BigInt(req.params.id);
  const r = await enqueueCampaignTargets(id);
  // status running
  await prisma.campaigns.update({ where: { id: id as any }, data: { status: "running" } });
  res.json(r);
});
