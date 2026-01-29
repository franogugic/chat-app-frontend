import { useState, useEffect } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatWindow } from "./components/ChatWindow";
import { getConversationById, getUserConversations, type ConversationResponse } from "../auth/api/conversation.api";
import { useAuth } from "../auth/context/useAuth";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  // 1. Učitavanje svih konverzacija za sidebar
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const data = await getUserConversations();
        const convs = (data as any).conversations || data;
        setConversations(Array.isArray(convs) ? convs : []);
      } catch (err) {
        console.error("Greška pri učitavanju konverzacija:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // 2. Učitavanje poruka - POPRAVLJENO
  useEffect(() => {
    const cid = selectedConversation?.id;
    
    // Blokiramo samo ako je ID baš prazan ili undefined. 
    // NE blokiramo ako je isNew, jer moramo provjeriti postoji li već chat za tog usera.
    if (!cid || cid === "undefined") {
      return;
    }

    const fetchMessages = async () => {
      try {
        // Zovemo API da vidimo imamo li već ovaj chat u bazi
        const data = await getConversationById(cid);
        
        // Ako backend nađe chat, ažuriramo stanje s porukama i gasimo isNew
        setSelectedConversation((prev: any) => ({
          ...prev,
          ...data,
          isNew: false 
        }));
      } catch (err) {
        // Ako je 404, šutimo i ostavljamo prozor praznim (isNew ostaje true)
        console.log("Chat još ne postoji u bazi podataka.");
      }
    };

    fetchMessages();
  }, [selectedConversation?.id]); // Reagira na promjenu selekcije

  const handleNewMessage = async (sentMessage: any) => {
    if (sentMessage && sentMessage.conversationId) {
      setSelectedConversation((prev: any) => ({
        ...prev,
        id: sentMessage.conversationId,
        isNew: false,
        messages: [...(prev?.messages || []), sentMessage]
      }));
    }

    // Osvježi sidebar
    const data = await getUserConversations();
    const convs = (data as any).conversations || data;
    setConversations(Array.isArray(convs) ? convs : []);
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden font-sans">
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
      />
    </div>
  );
}