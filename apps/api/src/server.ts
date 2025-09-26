// apps/api/src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

// GET /contacts?tenant_id=1&search=kelven
app.get("/contacts", async (req, res) => {
  const tenantId = req.query.tenant_id ? BigInt(req.query.tenant_id as string) : undefined;
  const search = (req.query.search as string) || "";

  const where: any = {};
  if (tenantId) where.tenant_id = tenantId as any;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const contacts = await prisma.contacts.findMany({
    where,
    take: 100,
    orderBy: { created_at: "desc" },
  });

  res.json(contacts);
});

// POST /contacts
app.post("/contacts", async (req, res) => {
  const { tenant_id, name, phone, channel, email, tags } = req.body;

  const contact = await prisma.contacts.create({
    data: {
      tenant_id: BigInt(tenant_id) as any,
      name,
      phone,
      channel, // "whatsapp" | "telegram" | "sms" | "email"
      email,
      tags,    // se sua coluna é JSON
    },
  });

  res.status(201).json(contact);
});

// POST /conversations
app.post("/conversations", async (req, res) => {
  const { tenant_id, contact_id, channel } = req.body;

  const conv = await prisma.conversations.create({
    data: {
      tenant_id: BigInt(tenant_id) as any,
      contact_id: BigInt(contact_id) as any,
      channel,              // enum do seu schema
      state: "LEAD_NOVO",   // ajuste se o enum veio diferente
    },
  });

  res.status(201).json(conv);
});

// POST /messages/send
app.post("/messages/send", async (req, res) => {
  const { conversation_id, body } = req.body;

  const msg = await prisma.messages.create({
    data: {
      conversation_id: BigInt(conversation_id) as any,
      direction: "out",
      type: "text",
      body,
      status: "sent",
    },
  });

  await prisma.conversations.update({
    where: { id: BigInt(conversation_id) as any },
    data: { last_message_at: new Date() },
  });

  res.status(201).json(msg);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API up on :${port}`));
