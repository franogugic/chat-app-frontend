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

  const displayName = conversation.title || "Korisnik";
  const lastMsg = conversation.lastMessage as any;
  const isLastMessageMe = lastMsg?.senderId === currentUserId;
  
  // LOGIKA ZA BOLD: Ako poruka NIJE moja i NIJE pročitana
  const isUnreadByMe = !isLastMessageMe && lastMsg && !lastMsg.isRead;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-50 ${
        isSelected ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium uppercase shadow-sm">
          {displayName[0]}
        </div>
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm truncate ${isUnreadByMe ? 'font-black text-gray-900' : (isSelected ? 'font-bold text-blue-900' : 'font-medium text-gray-700')}`}>
            {displayName}
          </h3>
          <span className={`text-[10px] ${isUnreadByMe ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
            {lastMsg ? formatTime(lastMsg.sentAt || lastMsg.createdAt) : ""}
          </span>
        </div>
        
        <div className="flex items-center gap-1 min-w-0">
          {/* PLAVE KVAČICE AKO JE KORISNIK PROČITAO MOJU PORUKU */}
          {isLastMessageMe && lastMsg && (
            <div className={`flex flex-shrink-0 items-center ${lastMsg.isRead ? "text-blue-500" : "text-gray-300"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <svg className="w-3.5 h-3.5 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <p className={`text-sm truncate ${isUnreadByMe ? 'font-bold text-gray-900' : (isSelected ? 'text-blue-700' : 'text-gray-500')}`}>
            {lastMsg?.content || "Započni razgovor..."}
          </p>
        </div>
      </div>
      
      {isUnreadByMe && (
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_5px_rgba(37,99,235,0.5)]"></div>
      )}
    </button>
  );
}