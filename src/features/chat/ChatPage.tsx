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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // Pratimo online ID-ove
  const { user, logout } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const fetchConversations = async () => {
    try {
      const data = await getUserConversations();
      const convs = (data as any).conversations || data;
      setConversations(Array.isArray(convs) ? convs : []);
    } catch (err) { console.error(err); }
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
      .then(() => {
        setConnection(newConnection);
        // Kada se spoji, možemo tražiti listu svih trenutno online usera ako backend to podržava
        // Ili čekati "UserStatusChanged" evente
      })
      .catch(err => console.log(err));

    return () => { newConnection.stop(); };
  }, []);

  useEffect(() => {
    if (connection) {
      // Slušamo promjene statusa za SIDEBAR
      connection.on("UserStatusChanged", (userId: string, isOnline: boolean) => {
        setOnlineUsers(prev => {
          if (isOnline) return prev.includes(userId) ? prev : [...prev, userId];
          return prev.filter(id => id !== userId);
        });
      });

      connection.on("ReceiveMessage", (message: any) => {
        const currentConvId = selectedConversation?.id ? String(selectedConversation.id).toLowerCase() : null;
        const incomingId = String(message.conversationId || message.ConversationId).toLowerCase();
        
        if (incomingId === currentConvId) {
          setSelectedConversation((prev: any) => {
            if (!prev) return prev;
            if (prev.messages?.some((m: any) => (m.id || m.Id) === (message.id || message.Id))) return prev;
            return { ...prev, messages: [...(prev.messages || []), message] };
          });
        }
        fetchConversations();
      });

      connection.on("MessagesRead", (convId: string) => {
        if (selectedConversation?.id && String(selectedConversation.id).toLowerCase() === convId.toLowerCase()) {
           getConversationById(convId).then(data => setSelectedConversation(prev => prev ? { ...prev, ...data } : null));
        }
        fetchConversations();
      });
    }
    return () => {
      connection?.off("UserStatusChanged");
      connection?.off("ReceiveMessage");
      connection?.off("MessagesRead");
    };
  }, [connection, selectedConversation?.id]);

  // Mapiramo konverzacije i dodajemo isOnline status na temelju onlineUsers niza
  const conversationsWithStatus = conversations.map(conv => {
    const partnerId = conv.recipientId || conv.participants?.find((p: any) => p.userId !== user?.id)?.userId;
    return {
      ...conv,
      isOnline: onlineUsers.includes(partnerId || '')
    };
  });

  const handleNewMessage = (sentMessage: any) => {
    if (sentMessage && sentMessage.conversationId) {
      setSelectedConversation((prev: any) => {
        if (!prev) return prev;
        return { ...prev, id: sentMessage.conversationId, isNew: false, messages: [...(prev?.messages || []), sentMessage] };
      });
    }
    fetchConversations();
  };

  return (
    <div className="h-screen w-full flex bg-gray-50 overflow-hidden font-sans">
      <ChatSidebar 
        conversations={conversationsWithStatus}
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