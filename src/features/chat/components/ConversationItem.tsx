import { type ConversationResponse } from "../../auth/api/conversation.api";

interface ConversationItemProps {
  conversation: ConversationResponse;
  isSelected: boolean;
  onClick: () => void;
  currentUserId?: string;
}

export function ConversationItem({ conversation, isSelected, onClick, currentUserId }: ConversationItemProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const lastMsg = conversation.lastMessage as any;
  const isLastMessageMe = lastMsg?.senderId === currentUserId;
  const unreadCount = (conversation as any).frontendUnreadCount || 0;
  
  // Detekcija imena kao u sidebar pretrazi
  const displayName = conversation.title || conversation.name || (conversation as any).username || "User";

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition relative border-r-4 ${
        isSelected ? 'bg-blue-50 border-blue-600' : 'border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium uppercase text-xl shadow-sm">
          {displayName[0]}
        </div>
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={`truncate ${unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
            {displayName}
          </h3>
          <span className={`text-[10px] ${unreadCount > 0 ? "text-blue-600 font-bold" : "text-gray-500"}`}>
            {formatTime(lastMsg?.sentAt || lastMsg?.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isLastMessageMe && (
              <div className={`flex flex-shrink-0 items-center ${(lastMsg?.isRead || lastMsg?.IsRead) ? "text-blue-500" : "text-gray-400"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                <svg className="w-3.5 h-3.5 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <p className={`text-sm truncate ${unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
              {lastMsg?.content || "No messages yet"}
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-[10px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {isUnreadByMe && (
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_5px_rgba(37,99,235,0.5)]"></div>
      )}
    </button>
  );
}