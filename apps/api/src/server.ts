import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

// listar contatos
app.get("/contacts", async (req, res) => {
  const contacts = await prisma.contact.findMany({ take: 100 });
  res.json(contacts);
});

// criar contato
app.post("/contacts", async (req, res) => {
  const { tenant_id, name, phone, channel, email, tags } = req.body;
  const c = await prisma.contact.create({
    data: { tenant_id: BigInt(tenant_id), name, phone, channel, email, tags },
  });
  res.status(201).json(c);
});

// criar conversa
app.post("/conversations", async (req, res) => {
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

// enviar mensagem (mock) – aqui futuramente chama o Gateway real
app.post("/messages/send", async (req, res) => {
  const { conversation_id, body } = req.body;
  const msg = await prisma.message.create({
    data: {
      conversation_id: BigInt(conversation_id),
      direction: "out",
      type: "text",
      body,
      status: "sent",
    },
  });
  res.status(201).json(msg);
});

const port = 4000;
app.listen(port, () => console.log(`API up on :${port}`));
