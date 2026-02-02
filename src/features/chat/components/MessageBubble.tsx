interface MessageBubbleProps {
  content: string;
  sentAt: string;
  isMe: boolean;
  isRead?: boolean;
}

export function MessageBubble({ content, sentAt, isMe, isRead }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
          isMe
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
        }`}
      >
        <p className="text-[15px] leading-relaxed break-words">{content}</p>
        <div className={`flex items-center mt-1 gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(sentAt)}
          </span>
          {isMe && (
            <div className="flex items-center ml-0.5">
              <svg className={`w-3 h-3 ${isRead ? "text-white" : "text-blue-200 opacity-60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              {isRead && (
                <svg className="w-3 h-3 text-white -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}