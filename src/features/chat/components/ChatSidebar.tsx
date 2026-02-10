import { useState, useEffect } from "react";
import { searchUsers, type AllUsersBySearchResponseDTO } from "../../auth/api/auth.api";
import { ConversationItem } from "./ConversationItem";
import { Search, LogOut, MessageCircle } from "lucide-react";

interface SidebarProps {
  currentUser: any;
  logout: () => void;
  conversations: any[];
  selectedId?: string;
  onSelectConversation: (c: any) => void;
  onSelectUserFromSearch: (user: any) => void;
  loading: boolean;
  onSelect: (conversation: any) => void;
  unreadConversations: Set<string>;
}

export function ChatSidebar({ currentUser, logout, conversations, selectedId, onSelectConversation, onSelectUserFromSearch, loading, unreadConversations }: SidebarProps) {
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
    <div className="w-full lg:w-1/3 border-r border-gray-200 flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentUser?.name}</h2>
              <p className="text-xs text-gray-500">
                {isSearchMode ? "Searching users" : "Conversations"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearchMode ? (
          <div className="p-2">
            {searchResults.length > 0 ? (
              searchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => { onSelectUserFromSearch(u); setSearch(""); }}
                  className="p-4 rounded-lg cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all mb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {u.name[0].toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  </div>
                </div>
              ))
            ) : (
              !isSearching && (
                <div className="text-center py-10 px-4">
                  <p className="text-sm text-gray-500">No results for "{search}"</p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-2">
            {loading ? (
              <p className="text-center text-gray-500 text-sm mt-10">Loading...</p>
            ) : conversations.length > 0 ? (
              conversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isSelected={selectedId === c.id}
                  onClick={() => onSelectConversation(c)}
                  hasUnread={unreadConversations.has(String(c.id).toLowerCase())}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm mt-10">No active conversations</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}