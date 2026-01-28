import { useState, useEffect } from "react";
import { searchUsers, type AllUsersBySearchResponseDTO } from "../../auth/api/auth.api";
import { ConversationItem } from "./ConversationItem";

interface SidebarProps {
  currentUser: any;
  logout: () => void;
  conversations: any[];
  selectedId?: string;
  onSelectConversation: (c: any) => void;
  onSelectUserFromSearch: (userId: string) => void;
  loading: boolean;
}

export function ChatSidebar({ currentUser, logout, conversations, selectedId, onSelectConversation, onSelectUserFromSearch, loading }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<AllUsersBySearchResponseDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // AKO JE MANJE OD 2 SLOVA: Odmah ugasi loading i očisti rezultate
    if (search.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false); 
      return;
    }

    // AKO JE 2 ILI VIŠE SLOVA: Pokreni loading i čekaj 500ms
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsers(search);
        setSearchResults(users || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false); // OVO GASI LOADING KAD API ZAVRŠI
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const isSearchMode = search.trim().length >= 2;

  return (
    <div className="w-1/4 border-r border-gray-800 flex flex-col bg-gray-800 z-10 shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
        <div className="flex flex-col">
          <span className="font-bold text-blue-400 text-sm">{currentUser?.name}</span>
          <span className="text-[10px] text-gray-500 uppercase font-black">
            {isSearchMode ? "Pretraga" : "Moji Chatovi"}
          </span>
        </div>
        <button onClick={logout} className="text-[10px] bg-red-500/10 text-red-500 px-3 py-1.5 rounded-md font-bold hover:bg-red-500 hover:text-white transition-all">
          IZLAZ
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pronađi nekoga..."
          className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {/* Loader se vrti samo dok isSearching traje */}
        {isSearching && (
          <div className="absolute right-7 top-7 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        )}
      </div>

      {/* Dinamička lista */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isSearchMode ? (
          <div className="space-y-1">
            {searchResults.length > 0 ? (
              /* Ima rezultata */
              searchResults.map((u) => (
                <div 
                  key={u.id} 
                  onClick={() => { onSelectUserFromSearch(u.id); setSearch(""); }} 
                  className="p-4 rounded-xl cursor-pointer bg-blue-600/5 hover:bg-blue-600/20 border border-blue-500/10 transition-all group"
                >
                  <p className="text-sm font-bold text-gray-200 group-hover:text-blue-400">{u.name}</p>
                </div>
              ))
            ) : (
              /* Nema rezultata (prikazuje se samo ako NIJE loading) */
              !isSearching && (
                <div className="text-center py-10 px-4 animate-fadeIn">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm text-gray-400 italic">Nismo pronašli korisnika</p>
                  <p className="text-sm font-bold text-blue-500">"{search}"</p>
                </div>
              )
            )}
          </div>
        ) : (
          /* Moji razgovori */
          <div className="space-y-1">
            {loading ? (
              <p className="text-center text-gray-600 text-xs mt-10">Učitavanje razgovora...</p>
            ) : conversations.length > 0 ? (
              conversations.map((c) => (
                <ConversationItem 
                  key={c.id} 
                  conversation={c} 
                  isSelected={selectedId === c.id} 
                  onClick={() => onSelectConversation(c)} 
                />
              ))
            ) : (
              <p className="text-center text-gray-600 text-xs mt-10 italic">Još nemaš aktivnih razgovora.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}