import { useState, type FormEvent, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { sendMessage } from "../../auth/api/conversation.api";
import { Phone, Video, Info, MoreVertical, Paperclip, Smile, Send, MessageCircle } from 'lucide-react';

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
        .catch((err: any) => console.error("Greška pri slanju Seen statusa:", err));
    }
  }, [conversation?.id, conversation?.messages?.length, connection]);

  useEffect(() => {
    if (!connection || !conversation) {
      setIsPartnerOnline(false);
      return;
    }
    const partnerId = conversation.isNew 
      ? conversation.id 
      : conversation.participants?.find((p: any) => p.userId !== currentUserId)?.userId 
        || conversation.recipientId 
        || conversation.otherUserId;

    if (!partnerId) return;

    connection.invoke("IsThisUserOnline", partnerId)
      .then((online: boolean) => setIsPartnerOnline(online))
      .catch((err: any) => console.error("Greška pri provjeri statusa:", err));

    const handleStatusChange = (userId: string, isOnline: boolean) => {
      if (userId === partnerId) setIsPartnerOnline(isOnline);
    };
    connection.on("UserStatusChanged", handleStatusChange);
    return () => { connection.off("UserStatusChanged", handleStatusChange); };
  }, [connection, conversation, currentUserId]);

  const getChatTitle = () => {
    if (!conversation) return "";
    if (conversation.isNew) return conversation.name || "Korisnik";
    if (conversation.title) return conversation.title;
    const other = conversation.participants?.find((p: any) => p.userId !== currentUserId);
    return other?.name || conversation.name || "Korisnik";
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
    } catch (error) { console.error("Greška pri slanju:", error); }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-sm font-medium uppercase tracking-widest">Odaberite razgovor za početak</p>
      </div>
    );
  }

  const chatPartnerName = getChatTitle();
  const messages = conversation.messages || [];

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
              {chatPartnerName[0]}
            </div>
            {isPartnerOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
          </div>
          <div>
            <h2 className="font-medium text-gray-900 leading-none">{chatPartnerName}</h2>
            <p className="text-xs text-gray-500 mt-1">{isPartnerOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition"><Phone className="w-5 h-5 text-gray-500" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition"><Video className="w-5 h-5 text-gray-500" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition"><Info className="w-5 h-5 text-gray-500" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
          <div className="text-center text-gray-400 text-sm mt-10 italic">Nema poruka u ovom razgovoru.</div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="max-w-5xl mx-auto flex items-end gap-3">
          <button type="button" className="p-2.5 hover:bg-gray-100 rounded-lg transition shrink-0">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Napiši poruku..."
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
            />
          </div>
          <button 
            type="submit" 
            disabled={!messageInput.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shrink-0 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}