import { Check, CheckCheck } from "lucide-react";

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
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
          isMe
            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{content}</p>

        <div className={`flex items-center mt-1 gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
          <span className={`text-xs ${isMe ? "text-blue-100" : "text-gray-500"}`}>
            {formatTime(sentAt)}
          </span>

          {isMe && (
            <div className="flex items-center">
              {isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-100" />
              ) : (
                <Check className="w-3.5 h-3.5 text-blue-200" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}