import { useEffect, useState } from "react";
import { getUserConversations, getConversationById } from "../auth/api/conversation.api";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatWindow } from "./components/ChatWindow";
import { useAuth } from "../auth/context/useAuth";

export function ChatPage() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);

  // Dohvat svih konverzacija (radi s Ok(conversations))
  useEffect(() => {
    setLoadingChats(true);
    getUserConversations()
      .then((data: any) => {
        setConversations(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoadingChats(false));
  }, []);

  const handleSelectConversation = async (conv: any) => {
    // PAŽNJA: Tvoj backend treba ID DRUGOG KORISNIKA (userId2)
    // Pretpostavljam da tvoj objekt konverzacije ima polje 'otherUserId' ili 'participantId'
    // Ako nema, koristi conv.id samo ako je to zapravo ID korisnika
    const otherUserId = conv.otherUserId || conv.userId || conv.id;

    if (!otherUserId) return;

    // Postavi privremeno da se prozor otvori
    setSelectedConversation(conv);

    try {
      const fullDetails = await getConversationById(otherUserId);
      
      if (fullDetails) {
        // Ako konverzacija postoji, prikaži je s porukama
        setSelectedConversation(fullDetails);
      } else {
        // Ako je null (Ok(null)), postavi prazan template s tim korisnikom
        setSelectedConversation({ ...conv, messages: [] });
      }
    } catch (err) {
      console.error("Greška pri učitavanju poruka", err);
    }
  };

  const handleSelectUserFromSearch = (userId: string) => {
  handleSelectConversation({ id: userId });
};

  return (
  <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
    <ChatSidebar 
      currentUser={user}
      logout={logout} // DODAJ OVO
      conversations={conversations}
      selectedId={selectedConversation?.id}
      onSelectConversation={handleSelectConversation}
      onSelectUserFromSearch={handleSelectUserFromSearch} 
      loading={loadingChats}
    />
    
    <ChatWindow 
      conversation={selectedConversation}
      currentUserId={user?.id}
    />
  </div>
);
}