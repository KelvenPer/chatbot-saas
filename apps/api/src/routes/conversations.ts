import { Router } from "express";
import { prisma } from "../lib/prisma";

export const conversationsRouter = Router();

// GET /conversations?tenant_id=1&contact_id=123
conversationsRouter.get("/", async (req, res) => {
  const tenantId = BigInt(req.query.tenant_id as string);
  const contactId = req.query.contact_id ? BigInt(req.query.contact_id as string) : undefined;

  const conversations = await prisma.conversation.findMany({
    where: { tenant_id: tenantId, ...(contactId ? { contact_id: contactId } : {}) },
    orderBy: { updated_at: "desc" },
  });
  res.json(conversations);
});

// GET /conversations/:id/messages
conversationsRouter.get("/:id/messages", async (req, res) => {
  const id = BigInt(req.params.id);
  const msgs = await prisma.message.findMany({
    where: { conversation_id: id },
    orderBy: { created_at: "asc" },
  });
  res.json(msgs);
});

// POST /conversations
conversationsRouter.post("/", async (req, res) => {
  const { tenant_id, contact_id, channel } = req.body;
  const conv = await prisma.conversation.create({
    data: {
      tenant_id: BigInt(tenant_id),
      contact_id: BigInt(contact_id),
      channel,
      state: "LEAD_NOVO",
    },
  });
  res.status(201).json(conv);
});
