import { API_BASE_URL } from "../utils/config";

export interface LastMessage {
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface ConversationResponse {
  id: string;
  title: string;
  lastMessage: LastMessage | null;
}

export interface GetConversationsResponse {
  user: string;
  conversations: ConversationResponse[];
}

export async function getUserConversations(): Promise<GetConversationsResponse> {
  const response = await fetch(`${API_BASE_URL}/conversation/user/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  return response.json();
}