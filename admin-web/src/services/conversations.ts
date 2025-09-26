import { api } from "../api";
import type { Conversation, Message } from "../types";

export async function fetchConversations(tenantId = 1, contactId?: number) {
  const { data } = await api.get<Conversation[]>("/conversations", {
    params: { tenant_id: tenantId, contact_id: contactId },
  });
  return data;
}

export async function fetchMessages(conversationId: number) {
  const { data } = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
  return data;
}

export async function sendMessage(conversationId: number, body: string) {
  const { data } = await api.post<Message>("/messages/send", {
    conversation_id: conversationId,
    body,
  });
  return data;
}

// mock para simular recebimento
export async function mockIncoming(conversationId: number, body: string) {
  const { data } = await api.post<Message>("/messages/mock-in", {
    conversation_id: conversationId,
    body,
  });
  return data;
}

// SSE
export function openSSE(onMessageNew: (msg: Message)=>void) {
  const ev = new EventSource(`${import.meta.env.VITE_API_URL}/events/stream`);
  const handler = (e: MessageEvent) => {
    const payload = JSON.parse(e.data);
    onMessageNew(payload);
  };
  ev.addEventListener("message:new", handler as any);
  return () => {
    ev.removeEventListener("message:new", handler as any);
    ev.close();
  };
}
