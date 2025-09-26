import { Router } from "express";
import { prisma } from "../lib/prisma";

export const contactsRouter = Router();

// GET /contacts?tenant_id=1&search=kelven
contactsRouter.get("/", async (req, res) => {
  const tenantId = BigInt(req.query.tenant_id as string);
  const search = (req.query.search as string) || "";
  const contacts = await prisma.contact.findMany({
    where: {
      tenant_id: tenantId,
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ],
    },
    take: 100,
    orderBy: { created_at: "desc" },
  });
  res.json(contacts);
});

// POST /contacts
contactsRouter.post("/", async (req, res) => {
  const { tenant_id, name, phone, channel, email, tags } = req.body;
  const contact = await prisma.contact.create({
    data: {
      tenant_id: BigInt(tenant_id),
      name,
      phone,
      channel,
      email,
      tags,
    },
  });
  res.status(201).json(contact);
});
