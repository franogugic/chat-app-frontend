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
  // Ovaj isOnline dolazi iz ChatPage mapiranja
  const isOnline = (conversation as any).isOnline; 

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition relative ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium uppercase text-xl">
          {(conversation.title || conversation.name || "P")[0]}
        </div>
        
        {/* Zelena pulsirajuća točkica */}
        {isOnline && (
          <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white"></span>
          </span>
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.title || conversation.name || "Korisnik"}
          </h3>
          <span className="text-[10px] text-gray-500">
            {formatTime(lastMsg?.sentAt || lastMsg?.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1 min-w-0">
          {isLastMessageMe && (
            <div className={`flex flex-shrink-0 items-center ${lastMsg?.isRead ? "text-blue-500" : "text-gray-400"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <svg className="w-3.5 h-3.5 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <p className={`text-sm truncate ${isSelected ? "text-blue-700 font-medium" : "text-gray-500"}`}>
            {lastMsg?.content || "Započni razgovor..."}
          </p>
        </div>
      </div>
    </button>
  );
}