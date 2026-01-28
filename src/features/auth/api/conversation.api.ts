import { API_BASE_URL } from "../utils/config";

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
}

export interface ConversationResponse {
  id: string;
  title: string;
  lastMessage: LastMessage | null;
  messages?: MessageResponse[]; 
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

export async function createConversation(otherUserId: string): Promise<ConversationResponse> {
  const response = await fetch(`${API_BASE_URL}/conversations/private/${otherUserId}`, {
    method: "POST", 
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Neuspješno kreiranje konverzacije");
  return response.json();
}

export async function getConversationById(otherUserId: string): Promise<any> {
  const url = `${API_BASE_URL}/conversation/private/${otherUserId}`;
  
  console.log("Dohvaćam razgovor s korisnikom:", otherUserId);

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) throw new Error("Neuspješno dohvaćanje razgovora");
  
  return response.json(); 
}

