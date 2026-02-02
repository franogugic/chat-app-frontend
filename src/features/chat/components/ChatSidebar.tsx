import { useState, useEffect } from "react";
import { searchUsers, type AllUsersBySearchResponseDTO } from "../../auth/api/auth.api";
import { ConversationItem } from "./ConversationItem";
import { MessageCircle, Settings, LogOut, Search } from 'lucide-react';

interface SidebarProps {
  currentUser: any;
  logout: () => void;
  conversations: any[];
  selectedId?: string;
  onSelectConversation: (c: any) => void;
  onSelectUserFromSearch: (user: any) => void;
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
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Poruke</h1>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-blue-600 mr-2">{currentUser?.name}</span>
            <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isSearchMode ? (
          <div className="flex flex-col">
            {searchResults.length > 0 ? (
              searchResults.map((u) => (
                <button 
                  key={u.id} 
                  onClick={() => { onSelectUserFromSearch(u); setSearch(""); }} 
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-50"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold uppercase">
                    {u.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-blue-500">Započni novi chat</p>
                  </div>
                </button>
              ))
            ) : (
              !isSearching && (
                <div className="p-10 text-center text-gray-500 text-sm italic">Nema rezultata za "{search}"</div>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {loading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Učitavanje...</div>
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
              <div className="p-10 text-center text-gray-500 text-sm italic">Nema aktivnih razgovora.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}