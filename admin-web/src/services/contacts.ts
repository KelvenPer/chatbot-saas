import { api } from "../api";
import type { Contact } from "../types";

export async function fetchContacts(tenantId = 1, search = ""): Promise<Contact[]> {
  const { data } = await api.get("/contacts", { params: { tenant_id: tenantId, search } });
  return data;
}

export async function createContact(payload: Partial<Contact> & { tenant_id: number|string }) {
  const { data } = await api.post("/contacts", payload);
  return data as Contact;
}
