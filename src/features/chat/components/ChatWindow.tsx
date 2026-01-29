import { useState, type FormEvent, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { sendMessage } from "../../auth/api/conversation.api";

interface ChatWindowProps {
  conversation: any | null;
  currentUserId?: string;
  onNewMessage?: (msg: any) => void;
}

export function ChatWindow({ conversation, currentUserId, onNewMessage }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const getChatTitle = () => {
    if (!conversation) return "";
    
    // Ako je user iz searcha, on ima polje 'name'
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
      const conversationIdToSend = isNew 
        ? "00000000-0000-0000-0000-000000000000" 
        : conversation.id;

      // Za novog usera recipientId je njegov ID (id iz search rezultata)
      const recipientId = isNew ? conversation.id : (conversation.recipientId || conversation.id);

      const sentMessage = await sendMessage(
        messageInput,
        recipientId,
        conversationIdToSend
      );

      setMessageInput("");
      if (onNewMessage) {
        onNewMessage(sentMessage);
      }
    } catch (error) {
      console.error("Greška pri slanju:", error);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20 bg-gray-950">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter text-gray-800">Chat App</h1>
        <p className="text-gray-600 text-xs font-bold tracking-[0.3em]">ODABERITE RAZGOVOR ZA POČETAK</p>
      </div>
    );
  }

  const chatPartnerName = getChatTitle();
  const messages = conversation.messages || [];

  return (
    <div className="flex-1 flex flex-col bg-gray-950 relative">
      <div className="p-5 border-b border-gray-800 bg-gray-900/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black mr-3 shadow-lg text-white uppercase">
            {chatPartnerName[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">{chatPartnerName}</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
        {messages.length > 0 ? (
          [...messages]
            .sort((a, b) => new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime())
            .map((msg: any, idx: number) => (
              <MessageBubble 
                key={msg.id || idx} 
                content={msg.content} 
                sentAt={msg.sentAt || msg.createdAt} 
                isMe={msg.senderId === currentUserId} 
              />
            ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
            <p className="text-sm font-medium text-gray-400">Vaš sandučić je prazan.</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-5 border-t border-gray-800 bg-gray-900/50">
        <form onSubmit={handleSend} className="max-w-5xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder={`Napiši poruku...`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl p-4 text-sm outline-none text-white focus:border-blue-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={!messageInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 px-8 py-3 rounded-2xl font-black text-sm uppercase text-white shadow-lg active:scale-95"
          >
            Pošalji
          </button>
        </form>
      </div>
    </div>
  );
}