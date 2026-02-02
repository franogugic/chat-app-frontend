interface MessageBubbleProps {
  content: string;
  sentAt: string;
  isMe: boolean;
  isRead?: boolean; // Prop koji smo dodali
}

export function MessageBubble({ content, sentAt, isMe, isRead }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm animate-fadeIn ${
        isMe
          ? "self-end bg-blue-600 text-white rounded-tr-none"
          : "self-start bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700"
      }`}
    >
      <p className="leading-relaxed break-words">{content}</p>
      
      <div className={`flex items-center mt-1 gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
        <span className="text-[9px] opacity-50">
          {formatTime(sentAt)}
        </span>
        
        {isMe && (
          <div className="flex items-center ml-1">
            {/* Prva kvačica - uvijek tu ako je poruka tvoja */}
            <svg 
              className={`w-3 h-3 ${isRead ? "text-blue-300" : "text-white/50"}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            
            {isRead && (
              <svg 
                className="w-3 h-3 text-blue-300 -ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}