import { type ConversationResponse } from "../../auth/api/conversation.api";

interface ConversationItemProps {
  conversation: ConversationResponse;
  isSelected: boolean;
  onClick: () => void;
  hasUnread: boolean;
}

export function ConversationItem({ conversation, isSelected, onClick, hasUnread }: ConversationItemProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all mb-2 ${
        isSelected
          ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
          : hasUnread
            ? "bg-blue-50 hover:bg-blue-100 border border-blue-200"
            : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSelected
            ? "bg-gradient-to-br from-blue-600 to-purple-600"
            : "bg-gradient-to-br from-blue-500 to-purple-500"
        }`}>
          <span className="text-white font-semibold text-lg">
            {(conversation.title || "P")[0].toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold text-sm truncate ${
              isSelected ? "text-blue-700" : "text-gray-900"
            }`}>
              {conversation.title || "Private conversation"}
            </h3>
            {conversation.lastMessage && (
              <span className={`text-xs ml-2 whitespace-nowrap ${
                hasUnread ? "text-blue-600 font-medium" : "text-gray-500"
              }`}>
                {formatTime(conversation.lastMessage.sentAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${
              hasUnread ? "text-gray-700 font-medium" : "text-gray-500"
            }`}>
              {conversation.lastMessage?.content || "Start conversation..."}
            </p>
            {hasUnread && !isSelected && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}