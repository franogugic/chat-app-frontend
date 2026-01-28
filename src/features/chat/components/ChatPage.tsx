import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { getUserConversations, type ConversationResponse } from "../../auth/api/conversation.api";
import { searchUsers, type AllUsersBySearchResponseDTO } from "../../auth/api/auth.api";

export function ChatPage() {
  const { user, logout } = useAuth();

  // --- STATE ---
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [searchResults, setSearchResults] = useState<AllUsersBySearchResponseDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);

  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);

  // 1. DOHVAĆANJE MOJIH KONVERZACIJA (Pri učitavanju)
  useEffect(() => {
    setLoadingConversations(true);
    getUserConversations()
      .then((data: any) => {
        // Provjera formata (lista ili objekt)
        const list = Array.isArray(data) ? data : data?.conversations || [];
        setConversations(list);
      })
      .catch((err) => console.error("Greška pri dohvatu:", err))
      .finally(() => setLoadingConversations(false));
  }, []);

  // 2. GLOBALNA PRETRAGA (Samo kad ima 2+ slova)
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingBackend(false);
      return;
    }

    setIsSearchingBackend(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const users = await searchUsers(search); 
        setSearchResults(users || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearchingBackend(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // 3. LOGIKA ZA PREKIDAČ
  const isSearchMode = search.trim().length >= 2;

  // 4. ŠTO SE DOGAĐA NA KLIK?
  const handleUserClick = (clickedUser: AllUsersBySearchResponseDTO) => {
    // Provjeri imamo li već chat s tim userom u 'conversations'
    const existingChat = conversations.find(c => c.title === clickedUser.name);
    
    if (existingChat) {
      setSelectedConversation(existingChat);
      setSearch(""); // Resetiraj search da se vratimo na listu chatova
    } else {
      console.log("Pozivam API za kreiranje novog chata s:", clickedUser.name);
      // Ovdje ćemo dodati poziv na backend: createConversation(clickedUser.id)
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-1/4 border-r border-gray-700 flex flex-col bg-gray-800 shadow-xl">
        
        {/* User Profile Info */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
          <div className="flex flex-col">
            <span className="font-bold text-blue-400">{user?.name}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              {isSearchMode ? "Pretraživanje baze" : "Moji Razgovori"}
            </span>
          </div>
          <button onClick={logout} className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">
            LOGOUT
          </button>
        </div>

        {/* Search Input Field */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Pronađi korisnika..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            {isSearchingBackend && (
              <div className="absolute right-3 top-2.5 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            )}
          </div>
        </div>

        {/* Dynamic List Area */}
        <div className="flex-1 overflow-y-auto px-2">
          {isSearchMode ? (
            /* --- REZULTATI PRETRAGE --- */
            <div className="animate-fadeIn">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div 
                    key={u.id} 
                    onClick={() => handleUserClick(u)}
                    className="p-3 mb-1 rounded-lg cursor-pointer bg-blue-600/5 hover:bg-blue-600/20 border border-blue-500/10 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium group-hover:text-blue-400">{u.name}</p>
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded italic">Novi chat</span>
                    </div>
                  </div>
                ))
              ) : !isSearchingBackend && (
                /* PORUKA ZA PRAZAN SEARCH */
                <div className="text-center py-10 px-4">
                  <p className="text-gray-600 text-2xl mb-2">🤷‍♂️</p>
                  <p className="text-sm text-gray-400 italic">Nema korisnika koji odgovara pojmu</p>
                  <p className="text-sm font-bold text-blue-500">"{search}"</p>
                </div>
              )}
            </div>
          ) : (
            /* --- MOJI AKTIVNI CHATOVI --- */
            <div>
              {loadingConversations ? (
                <p className="text-center text-gray-500 text-xs mt-10">Učitavanje razgovora...</p>
              ) : conversations.length > 0 ? (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConversation(c)}
                    className={`p-3 mb-1 rounded-lg cursor-pointer transition-all ${
                      selectedConversation?.id === c.id 
                        ? "bg-blue-600 shadow-lg translate-x-1" 
                        : "hover:bg-gray-700/50 text-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold truncate">{c.title}</span>
                      {c.lastMessage && (
                        <span className="text-[9px] opacity-40">
                          {new Date(c.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${selectedConversation?.id === c.id ? "text-blue-100" : "text-gray-500"}`}>
                      {c.lastMessage?.content || "Započni razgovor..."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 text-xs mt-10">Još nemaš aktivnih razgovora.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN CHAT DISPLAY --- */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-400">{selectedConversation.title}</h2>
            </div>
            
            {/* Messages Area (Placeholder) */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-gray-700">
               <div className="p-4 border border-dashed border-gray-800 rounded-lg">
                  Povijest poruka će biti prikazana ovdje.
               </div>
            </div>

            {/* Input Placeholder */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <input type="text" className="flex-1 bg-gray-800 border-none rounded-lg p-2.5 text-sm outline-none" placeholder="Napiši poruku..." />
                <button className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm">Send</button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Main Area */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800">
            <div className="mb-4 opacity-10">
               <svg width="100" height="100" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <p className="uppercase tracking-[0.2em] font-black text-3xl">Chat App</p>
            <p className="text-xs mt-2 text-gray-600 font-medium">ODABERITE RAZGOVOR ILI POTRAŽITE KORISNIKA</p>
          </div>
        )}
      </div>
    </div>
  );
}