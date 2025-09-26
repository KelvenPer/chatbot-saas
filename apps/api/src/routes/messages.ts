import { Router } from "express";
import { prisma } from "../lib/prisma";

export const messagesRouter = Router();

// POST /messages/send { conversation_id, body, media_id? }
messagesRouter.post("/send", async (req, res) => {
  const { conversation_id, body, media_id } = req.body;

  const msg = await prisma.message.create({
    data: {
      conversation_id: BigInt(conversation_id),
      direction: "out",
      type: media_id ? "document" : "text",
      body,
      media_id: media_id ? BigInt(media_id) : undefined,
      status: "sent",
    },
  });

  // Atualiza last_message_at e updated_at
  await prisma.conversation.update({
    where: { id: BigInt(conversation_id) },
    data: { last_message_at: new Date() },
  });

  // Notificar via SSE
  sseNotify("message:new", msg);

  res.status(201).json(msg);
});

// Simular recebimento (para testes locais)
// POST /messages/mock-in { conversation_id, body }
messagesRouter.post("/mock-in", async (req, res) => {
  const { conversation_id, body } = req.body;
  const msg = await prisma.message.create({
    data: {
      conversation_id: BigInt(conversation_id),
      direction: "in",
      type: "text",
      body,
      status: "delivered",
    },
  });
  await prisma.conversation.update({
    where: { id: BigInt(conversation_id) },
    data: { last_message_at: new Date() },
  });
  sseNotify("message:new", msg);
  res.status(201).json(msg);
});

// --- SSE helper (import circular simples) ---
type Listener = (event: string, payload: any) => void;
const listeners = new Set<Listener>();
export const sseRegister = (cb: Listener) => listeners.add(cb);
export const sseUnregister = (cb: Listener) => listeners.delete(cb);
export const sseNotify = (event: string, payload: any) =>
  listeners.forEach((l) => l(event, payload));
