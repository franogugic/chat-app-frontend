import { useState, type FormEvent, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { sendMessage } from "../../auth/api/conversation.api";
import { Send, MessageCircle } from "lucide-react";

interface ChatWindowProps {
  conversation: any | null;
  currentUserId?: string;
  onNewMessage?: (msg: any) => void;
  connection: any; 
}

export function ChatWindow({ conversation, currentUserId, onNewMessage, connection }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  useEffect(() => {
    if (connection && conversation?.id && !conversation.isNew) {
      connection.invoke("MarkAsRead", String(conversation.id))
        .catch((err: any) => console.error("Error sending seen status: ", err));
    }
  }, [conversation?.id, conversation?.messages?.length, connection]);

  useEffect(() => {
    if (!connection || !conversation) {
      setIsPartnerOnline(false);
      return;
    }

    if (connection.state !== "Connected") {
      setIsPartnerOnline(false);
      return;
    }

    const partnerId = conversation.isNew
      ? conversation.id
      : conversation.participants?.find((p: any) => p.userId !== currentUserId)?.userId
        || conversation.recipientId
        || conversation.otherUserId;

    if (!partnerId) {
      setIsPartnerOnline(false);
      return;
    }

    connection.invoke("IsThisUserOnline", partnerId)
      .then((online: boolean) => setIsPartnerOnline(online))
      .catch((err: any) => console.error("Error checking online status:", err));

    const handleStatusChange = (userId: string, isOnline: boolean) => {
      if (userId === partnerId) setIsPartnerOnline(isOnline);
    };

    connection.on("UserStatusChanged", handleStatusChange);

    return () => {
      connection.off("UserStatusChanged", handleStatusChange);
    };
  }, [connection, conversation, currentUserId]);

  const getChatTitle = () => {
    if (!conversation) return "";
    if (conversation.isNew) return conversation.name || "User";
    if (conversation.title) return conversation.title;
    const other = conversation.participants?.find((p: any) => p.userId !== currentUserId);
    return other?.name || conversation.name || "User";
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation) return;

    try {
      const isNew = conversation.isNew;
      const conversationIdToSend = isNew ? "00000000-0000-0000-0000-000000000000" : conversation.id;
      const recipientId = isNew ? conversation.id : (conversation.recipientId || conversation.id);

      const sentMessage = await sendMessage(messageInput, recipientId, conversationIdToSend);
      setMessageInput("");
      if (onNewMessage) onNewMessage(sentMessage);
    } catch (error) {
      console.error("Error sending:", error);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to ChatApp</h2>
        <p className="text-gray-500">Select a conversation to start</p>
      </div>
    );
  }

  const chatPartnerName = getChatTitle();
  const messages = conversation.messages || [];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-lg">
              {chatPartnerName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{chatPartnerName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`h-2 w-2 rounded-full ${isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-xs ${isPartnerOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isPartnerOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
        {messages.length > 0 ? (
          [...messages]
            .sort((a, b) => new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime())
            .map((msg: any, idx: number) => (
              <MessageBubble
                key={msg.id || idx}
                content={msg.content}
                sentAt={msg.sentAt || msg.createdAt}
                isMe={msg.senderId === currentUserId}
                isRead={msg.isRead}
              />
            ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-gray-500">Start conversation...</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            placeholder="Write a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}