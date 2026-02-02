import { useState, type FormEvent, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { sendMessage } from "../../auth/api/conversation.api";
import { Phone, Video, MoreVertical, Smile, Send, MessageCircle } from 'lucide-react';

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
      connection.invoke("MarkAsRead", String(conversation.id)).catch((err: any) => console.error(err));
    }
  }, [conversation?.id, conversation?.messages?.length, connection]);

  // Usklađena logika za partnera
  const partner = conversation?.participants?.find((p: any) => p.userId !== currentUserId) 
               || (conversation?.isNew ? conversation : null);
  
  const partnerId = partner?.userId || conversation?.recipientId || (conversation?.isNew ? conversation.id : null);
  const chatPartnerName = partner?.name || partner?.username || conversation?.title || conversation?.name || "Chat";

  useEffect(() => {
    if (!connection || !partnerId) {
      setIsPartnerOnline(false);
      return;
    }
    connection.invoke("IsThisUserOnline", partnerId)
      .then((online: boolean) => setIsPartnerOnline(online))
      .catch((err: any) => console.error(err));

    const handleStatusChange = (uId: string, status: boolean) => { if (uId === partnerId) setIsPartnerOnline(status); };
    connection.on("UserStatusChanged", handleStatusChange);
    return () => { connection.off("UserStatusChanged", handleStatusChange); };
  }, [connection, partnerId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation) return;
    try {
      const isNew = conversation.isNew;
      const conversationIdToSend = isNew ? "00000000-0000-0000-0000-000000000000" : conversation.id;
      const recipientId = isNew ? conversation.id : (conversation.recipientId || partnerId);
      const sentMessage = await sendMessage(messageInput, recipientId, conversationIdToSend);
      setMessageInput("");
      if (onNewMessage) onNewMessage(sentMessage);
    } catch (error) { console.error(error); }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 uppercase tracking-widest">Chat App</h2>
        <p className="text-gray-400 text-sm mt-2">Select a person to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium uppercase">
              {chatPartnerName[0]}
            </div>
            {isPartnerOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
          </div>
          <div>
            <h2 className="font-medium text-gray-900 leading-tight">{chatPartnerName}</h2>
            <p className={`text-xs ${isPartnerOnline ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
              {isPartnerOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition"><Phone className="w-5 h-5 text-gray-600" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition"><Video className="w-5 h-5 text-gray-600" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50">
        {(conversation.messages || []).map((msg: any, idx: number) => (
          <MessageBubble key={msg.id || idx} content={msg.content} sentAt={msg.sentAt || msg.createdAt} isMe={msg.senderId === currentUserId} isRead={msg.isRead} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder="Type a message..."
              rows={1}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500 transition block leading-normal"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button type="button" className="absolute right-3 p-1.5 hover:bg-gray-100 rounded-full transition"><Smile className="w-5 h-5 text-gray-400" /></button>
          </div>
          <button type="submit" disabled={!messageInput.trim()} className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}