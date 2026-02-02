import { type ConversationResponse } from "../../auth/api/conversation.api";

interface ConversationItemProps {
  conversation: ConversationResponse;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayName = conversation.title || "Korisnik";

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-50 ${
        isSelected ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium uppercase">
          {displayName[0]}
        </div>
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 ml-2">
            {conversation.lastMessage ? formatTime(conversation.lastMessage.sentAt) : ""}
          </span>
        </div>
        <p className={`text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
          {conversation.lastMessage?.content || "Započni razgovor..."}
        </p>
      </div>
    </button>
  );
}