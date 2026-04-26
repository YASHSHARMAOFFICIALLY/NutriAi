import { apiFetch } from "./client";
import type { ConversationDTO, ConversationSummary, SendChatResponse } from "./types";

export interface SendChatInput {
  message: string;
  conversationId?: string | null;
  title?: string | null;
}

export function sendChatMessage(input: SendChatInput): Promise<SendChatResponse> {
  return apiFetch<SendChatResponse>("/chat", { method: "POST", body: input });
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const res = await apiFetch<{ data: ConversationSummary[] }>("/chat/conversations");
  return res.data;
}

export function getConversation(id: string): Promise<ConversationDTO> {
  return apiFetch<ConversationDTO>(`/chat/conversations/${id}`);
}

export function deleteConversation(id: string): Promise<void> {
  return apiFetch<void>(`/chat/conversations/${id}`, { method: "DELETE" });
}
