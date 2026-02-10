import { authFetch } from "./authFetch";

export interface LastMessage {
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface MessageResponse {
  id: string;
  content: string;
  senderId: string;
  sentAt: string;
  conversationId?: string;
}

export interface ConversationResponse {
  id: string;
  title?: string;
  lastMessage?: LastMessage | null;
  messages?: MessageResponse[]; 
  isNew?: boolean;
  name?: string;
  participants?: { userId: string; name: string }[];
}

export interface GetConversationsResponse {
  user: string;
  conversations: ConversationResponse[];
}

export async function getUserConversations(): Promise<GetConversationsResponse> {
  // KORISTIMO authFetch umjesto fetch
  const response = await authFetch(`/conversation/user/conversations`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch conversations");
  return response.json();
}

export async function getConversationById(otherUserId: string): Promise<any> {
  if (!otherUserId || otherUserId === "undefined") {
    throw new Error("Invalid ID");
  }

  // KORISTIMO authFetch
  const response = await authFetch(`/conversation/private/${otherUserId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Chat not found (404)");
  }
  
  return response.json(); 
}

export async function sendMessage(content: string, recipientId: string, conversationId?: string) {
  const validConversationId = (conversationId && conversationId !== "undefined" && conversationId !== "00000000-0000-0000-0000-000000000000") 
    ? conversationId 
    : "00000000-0000-0000-0000-000000000000";

  // KORISTIMO authFetch
  const response = await authFetch(`/message/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: content,
      recipientId: recipientId,
      conversationId: validConversationId,
      messageType: 0 
    }),
  });

  if (!response.ok) throw new Error("Greška pri slanju poruke");
  return response.json();
}