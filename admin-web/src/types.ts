// src/types.ts

export type Channel = "whatsapp" | "telegram" | "sms" | "email";
export type Direction = "in" | "out";

export interface Contact {
  id: number;
  tenant_id: number | string;
  name?: string | null;
  phone: string;
  channel: Channel;
  email?: string | null;
  created_at?: string;
}

export interface Conversation {
  id: number;
  tenant_id: number | string;
  contact_id: number;
  channel: Channel;
  state: string;
  last_message_at?: string | null;
  created_at?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  direction: Direction;
  type: "text" | "image" | "audio" | "video" | "document";
  body?: string | null;
  status?: "queued" | "sent" | "delivered" | "read" | "failed";
  created_at: string;
}
