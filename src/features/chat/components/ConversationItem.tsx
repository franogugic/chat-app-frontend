import { type ConversationResponse } from "../../auth/api/conversation.api";

interface ConversationItemProps {
  conversation: ConversationResponse;
  isSelected: boolean;
  onClick: () => void;
  hasUnread: boolean;
}

export function ConversationItem({ conversation, isSelected, onClick, hasUnread }: ConversationItemProps) {
  // Formatiranje vremena zadnje poruke
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all mb-1 relative ${
        isSelected
          ? "bg-blue-600 shadow-lg shadow-blue-900/20 translate-x-1"
          : hasUnread
            ? "bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20"
            : "hover:bg-gray-700/50 text-gray-300"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`font-bold text-sm truncate pr-2 ${hasUnread && !isSelected ? "text-white" : ""}`}>
            {conversation.title || "Privatni razgovor"}
          </span>
          {hasUnread && !isSelected && (
            <div className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
          )}
        </div>
        {conversation.lastMessage && (
          <span className={`text-[9px] whitespace-nowrap ml-2 ${
            isSelected
              ? "text-blue-200"
              : hasUnread
                ? "text-blue-400 font-bold"
                : "text-gray-500"
          }`}>
            {formatTime(conversation.lastMessage.sentAt)}
          </span>
        )}
      </div>

      <p className={`text-xs truncate ${
        isSelected
          ? "text-blue-100"
          : hasUnread
            ? "text-gray-300 font-medium"
            : "text-gray-500"
      }`}>
        {conversation.lastMessage?.content || "Započni razgovor..."}
      </p>

      {hasUnread && !isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
          NOVO
        </div>
      )}
    </div>
  );
}