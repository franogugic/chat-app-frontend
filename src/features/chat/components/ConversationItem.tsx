import { type ConversationResponse } from "../../auth/api/conversation.api";

interface ConversationItemProps {
  conversation: ConversationResponse;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  // Formatiranje vremena zadnje poruke
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all mb-1 ${
        isSelected 
          ? "bg-blue-600 shadow-lg shadow-blue-900/20 translate-x-1" 
          : "hover:bg-gray-700/50 text-gray-300"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-sm truncate pr-2">
          {conversation.title || "Privatni razgovor"}
        </span>
        {conversation.lastMessage && (
          <span className={`text-[9px] whitespace-nowrap ${isSelected ? "text-blue-200" : "text-gray-500"}`}>
            {formatTime(conversation.lastMessage.sentAt)}
          </span>
        )}
      </div>
      
      <p className={`text-xs truncate ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
        {conversation.lastMessage?.content || "Započni razgovor..."}
      </p>
    </div>
  );
}