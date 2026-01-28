import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { getUserConversations, type ConversationResponse } from "../../auth/api/conversation.api";

export function ChatPage() {
  const { user, logout } = useAuth();
  
  // STATE ZA PODATKE
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // DOHVAĆANJE KONVERZACIJA S BACKENDA
  useEffect(() => {
    getUserConversations()
      .then((data) => {
        // data.conversations jer tvoj backend vraća objekt { user, conversations }
        setConversations(data.conversations || []);
      })
      .catch((err) => console.error("Greška pri dohvatu:", err))
      .finally(() => setLoading(false));
  }, []);

  // FILTRIRANJE PO TITLE-u (ime sugovornika koje smo sredili na backendu)
  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-blue-600 text-white">
      
      {/* --- BLOK 1: SIDEBAR (Lijeva strana) --- */}
      <div className="w-1/4 border-r border-gray-700 flex flex-col p-4 bg-gray-800">
        
        {/* Pretraga: Filtrira listu konverzacija lokalno */}
        <div className="flex flex-col mb-4">
          <input
            type="text"
            placeholder="Pretraži razgovore..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none"
          />
        </div>

        {/* Lista konverzacija: Prikazuje title i preview zadnje poruke */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {loading ? (
            <p className="text-gray-400 text-center">Učitavanje...</p>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedConversation(c)}
                className={`p-3 rounded cursor-pointer transition-all ${
                  selectedConversation?.id === c.id 
                    ? "bg-gray-700 border-l-4 border-blue-500 font-semibold" 
                    : "hover:bg-gray-700 border-l-4 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="block truncate max-w-[150px]">{c.title}</span>
                  {/* Prikaz vremena ako postoji poruka */}
                  {c.lastMessage && (
                    <span className="text-[10px] text-gray-500">
                      {new Date(c.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                
                {/* Preview zadnje poruke i plavi kružić za nepročitano */}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400 truncate flex-1">
                    {c.lastMessage?.content || "Nema poruka"}
                  </p>
                  {c.lastMessage && !c.lastMessage.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 mt-2 text-center text-sm">Nema aktivnih razgovora</p>
          )}
        </div>
      </div>

      {/* --- BLOK 2: MAIN CHAT AREA (Desna strana) --- */}
      <div className="flex-1 flex flex-col">
        
        {/* Header: Prikazuje ime trenutno odabranog sugovornika i tvoj Logout */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl font-semibold">
            {selectedConversation ? selectedConversation.title : "Odaberite razgovor"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <button
              onClick={logout}
              className="p-2 bg-red-500 rounded hover:bg-red-600 text-white text-xs"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Prozor s porukama: Ovdje će ići ispis poruka iz baze */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-900 flex flex-col gap-2">
          {selectedConversation ? (
            <>
              {/* Privremeni placeholderi dok ne povežemo getMessages endpoint */}
              <div className="self-start bg-gray-700 p-2 rounded max-w-xs">
                <p className="text-sm">Povijest poruka za {selectedConversation.title} će biti ovdje.</p>
              </div>
              {selectedConversation.lastMessage && (
                 <div className="self-end bg-blue-600 p-2 rounded max-w-xs">
                    <p className="text-sm">Zadnja poruka: {selectedConversation.lastMessage?.content}</p>
                 </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
               <p className="mt-4">Odaberite konverzaciju s lijeve strane</p>
            </div>
          )}
        </div>

        {/* --- BLOK 3: INPUT POLJE (Dno) --- */}
        {selectedConversation && (
          <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="Napiši poruku..."
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:border-blue-500"
            />
            <button className="p-2 bg-blue-500 rounded hover:bg-blue-600 text-white transition-colors">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}