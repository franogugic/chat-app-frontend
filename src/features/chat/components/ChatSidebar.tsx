import { useState, useEffect } from "react";
import { searchUsers, type AllUsersBySearchResponseDTO } from "../../auth/api/auth.api";
import { ConversationItem } from "./ConversationItem";
import { MessageCircle, LogOut, Search, UserX } from 'lucide-react';

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
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const isSearchMode = search.trim().length >= 2;

  const getExistingConversation = (userId: string) => {
    return conversations.find(c => 
      c.recipientId === userId || 
      c.participants?.some((p: any) => p.userId === userId)
    );
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Messages</h1>
          </div>
          <button onClick={logout} className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages or people..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isSearchMode ? (
          <div className="flex flex-col">
            {searchResults.length > 0 ? (
              searchResults.map((u) => {
                const existing = getExistingConversation(u.id);
                return (
                  <div 
                    key={u.id} 
                    onClick={() => { 
                      if (existing) onSelectConversation(existing);
                      else onSelectUserFromSearch(u); 
                      setSearch(""); 
                    }} 
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition border-b border-gray-50"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium uppercase">
                      {u.name[0]}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{u.name}</h3>
                      {existing && (
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-500 truncate">{existing.lastMessage?.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              !isSearching && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <UserX className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold">No results found</p>
                  <p className="text-sm text-gray-500 mt-1">Check the spelling or try a different name</p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((c) => (
              <ConversationItem 
                key={c.id} 
                conversation={c} 
                isSelected={selectedId === c.id} 
                onClick={() => onSelectConversation(c)}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}