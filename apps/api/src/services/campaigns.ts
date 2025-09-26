import { prisma } from "../lib/prisma";

export async function enqueueCampaignTargets(campaignId: bigint) {
  // pega campanha e segmento (ou contatos) — aqui simples: todos contatos do tenant
  const campaign = await prisma.campaigns.findUnique({ where: { id: campaignId as any } }); // se você introspectou com nome plural
  if (!campaign) throw new Error("Campaign not found");

  const contacts = await prisma.contact.findMany({
    where: { tenant_id: campaign.tenant_id as any },
    select: { id: true },
    take: 1000,
  });

  // cria targets únicos
  const data = contacts.map((c: { id: any; }) => ({
    campaign_id: campaignId as any,
    contact_id: c.id,
    status: "queued",
  }));

  // upsert em lote simples (ou use createMany)
  await prisma.campaign_targets.createMany({ data, skipDuplicates: true });

  return { enqueued: data.length };
}
