import { useState, useEffect } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatWindow } from "./components/ChatWindow";
import { getConversationById, getUserConversations, type ConversationResponse } from "../auth/api/conversation.api";
import { useAuth } from "../auth/context/useAuth";
import * as signalR from "@microsoft/signalr";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const fetchConversations = async () => {
    try {
      const data = await getUserConversations();
      const convs = (data as any).conversations || data;
      setConversations(Array.isArray(convs) ? convs : []);
    } catch (err) { console.error("Greška pri učitavanju:", err); }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchConversations().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5078/chatHub")
      .withAutomaticReconnect()
      .build();
    newConnection.start()
      .then(() => setConnection(newConnection))
      .catch(err => console.log("SignalR Error", err));
    return () => { newConnection.stop(); };
  }, []);

  useEffect(() => {
    if (connection && selectedConversation?.id) {
      const currentConvId = String(selectedConversation.id).toLowerCase();
      connection.on("ReceiveMessage", (message: any) => {
        const incomingId = String(message.conversationId || message.ConversationId || currentConvId).toLowerCase();
        if (incomingId === currentConvId) {
          setSelectedConversation((prev: any) => {
            if (!prev) return prev;
            const messageId = message.id || message.Id;
            const alreadyExists = prev.messages?.some((m: any) => (m.id || m.Id) === messageId);
            if (alreadyExists) return prev;
            return { ...prev, messages: [...(prev.messages || []), message] };
          });
        }
        fetchConversations();
      });
      connection.on("MessagesRead", (convId: string) => {
        if (String(selectedConversation.id).toLowerCase() === convId.toLowerCase()) {
           getConversationById(convId).then(data => {
             setSelectedConversation(prev => prev ? { ...prev, ...data } : null);
           });
        }
      });
      connection.invoke("JoinConversation", currentConvId);
    }
    return () => {
      connection?.off("ReceiveMessage");
      connection?.off("MessagesRead");
    };
  }, [connection, selectedConversation?.id]);

  useEffect(() => {
    const cid = selectedConversation?.id;
    if (!cid || cid === "undefined") return;
    const fetchMessages = async () => {
      try {
        const data = await getConversationById(cid);
        setSelectedConversation((prev: any) => ({ ...prev, ...data, isNew: false }));
      } catch (err) { console.log("Chat ne postoji."); }
    };
    fetchMessages();
  }, [selectedConversation?.id]);

  const handleNewMessage = (sentMessage: any) => {
    if (sentMessage && sentMessage.conversationId) {
      setSelectedConversation((prev: any) => {
        if (!prev) return prev;
        const messageId = sentMessage.id || sentMessage.Id;
        const alreadyExists = prev.messages?.some((m: any) => (m.id || m.Id) === messageId);
        if (alreadyExists) return prev;
        return {
          ...prev,
          id: sentMessage.conversationId,
          isNew: false,
          messages: [...(prev?.messages || []), sentMessage]
        };
      });
    }
    fetchConversations();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans antialiased text-gray-900">
      <ChatSidebar 
        conversations={conversations}
        currentUser={user}
        logout={logout}
        onSelectConversation={(conv) => setSelectedConversation({ ...conv, isNew: false })}
        onSelectUserFromSearch={(u) => setSelectedConversation({ ...u, isNew: true, messages: [] })}
        loading={isLoading}
        selectedId={selectedConversation?.id}
        onSelect={() => {}} 
      />
      <ChatWindow 
        conversation={selectedConversation} 
        currentUserId={user?.id}
        onNewMessage={handleNewMessage}
        connection={connection}
      />
    </div>
  );
}