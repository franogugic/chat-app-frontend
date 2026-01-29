import { useState, useEffect } from "react";
import { searchUsers, type AllUsersBySearchResponseDTO } from "../../auth/api/auth.api";
import { ConversationItem } from "./ConversationItem";

interface SidebarProps {
  currentUser: any;
  logout: () => void;
  conversations: any[];
  selectedId?: string;
  onSelectConversation: (c: any) => void;
  onSelectUserFromSearch: (user: any) => void; // Prima cijeli user objekt
  loading: boolean;
  onSelect: (conversation: any) => void;
}

export function ChatSidebar({ currentUser, logout, conversations, selectedId, onSelectConversation, onSelectUserFromSearch, loading }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<AllUsersBySearchResponseDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false); 
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsers(search);
        setSearchResults(users || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const isSearchMode = search.trim().length >= 2;

  return (
    <div className="w-1/4 border-r border-gray-800 flex flex-col bg-gray-800 z-10 shadow-2xl">
      <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
        <div className="flex flex-col text-white">
          <span className="font-bold text-blue-400 text-sm">{currentUser?.name}</span>
          <span className="text-[10px] text-gray-500 uppercase font-black">
            {isSearchMode ? "Pretraga" : "Moji Chatovi"}
          </span>
        </div>
        <button onClick={logout} className="text-[10px] bg-red-500/10 text-red-500 px-3 py-1.5 rounded-md font-bold hover:bg-red-500 hover:text-white transition-all">
          IZLAZ
        </button>
      </div>

      <div className="p-4 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pronađi nekoga..."
          className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
        />
        {isSearching && (
          <div className="absolute right-7 top-7 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isSearchMode ? (
          <div className="space-y-1">
            {searchResults.length > 0 ? (
              searchResults.map((u) => (
                <div 
                  key={u.id} 
                  onClick={() => { onSelectUserFromSearch(u); setSearch(""); }} 
                  className="p-4 rounded-xl cursor-pointer bg-blue-600/5 hover:bg-blue-600/20 border border-blue-500/10 transition-all group"
                >
                  <p className="text-sm font-bold text-gray-200 group-hover:text-blue-400">{u.name}</p>
                </div>
              ))
            ) : (
              !isSearching && (
                <div className="text-center py-10 px-4">
                  <p className="text-sm text-gray-400 italic text-white">Nema rezultata za "{search}"</p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {loading ? (
              <p className="text-center text-gray-600 text-xs mt-10">Učitavanje...</p>
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
              <p className="text-center text-gray-600 text-xs mt-10 italic">Nema aktivnih razgovora.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}