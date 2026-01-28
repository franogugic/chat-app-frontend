import { useState, type FormEvent } from "react";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  conversation: any | null;
  currentUserId?: string;
  onNewMessage?: (msg: any) => void;
}

export function ChatWindow({ conversation, currentUserId }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");

  // 1. Pronađi ime sugovornika (budući da je title null)
  const getChatTitle = () => {
    if (!conversation) return "";
    if (conversation.title) return conversation.title;
    
    // Ako nema title, nađi sudionika koji nisam ja
    const otherParticipant = conversation.participants?.find(
      (p: any) => p.userId !== currentUserId
    );
    return otherParticipant ? otherParticipant.name : "Korisnik";
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // TODO: Ovdje ćemo u idućem koraku dodati API poziv za sendMessage
    console.log("Šaljem poruku u chat:", conversation.id, "Sadržaj:", messageInput);
    
    setMessageInput("");
  };

  // Ako ništa nije odabrano
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20">
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 shadow-2xl mb-2">
           <svg className="w-10 h-10 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
           </svg>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-gray-800 uppercase">Chat App</h1>
        <p className="text-gray-600 text-xs font-bold tracking-[0.3em]">ODABERITE RAZGOVOR ZA POČETAK</p>
      </div>
    );
  }

  const chatPartnerName = getChatTitle();
  const hasMessages = conversation.messages && conversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-gray-950 relative">
      
      {/* HEADER */}
      <div className="p-5 border-b border-gray-800 bg-gray-900/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black mr-3 shadow-lg text-white">
            {chatPartnerName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">{chatPartnerName}</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
          </div>
        </div>
      </div>

      {/* AREA ZA PORUKE */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
        {hasMessages ? (
          /* ISPIS PORUKA */
          conversation.messages.map((msg: any, idx: number) => (
            <MessageBubble 
              key={msg.id || idx} 
              content={msg.content} 
              sentAt={msg.sentAt} 
              isMe={msg.senderId === currentUserId} 
            />
          ))
        ) : (
          /* TEMPLATE KAD NEMA PORUKA */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4 animate-fadeIn">
            <div className="p-6 rounded-full bg-gray-900 border border-gray-800 shadow-inner">
              <svg className="w-12 h-12 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-400">Vaš sandučić je prazan.</p>
              <p className="text-xs text-gray-500 italic max-w-[250px]">
                Pošalji poruku da započneš razgovor s korisnikom <span className="text-blue-500 font-bold">@{chatPartnerName}</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* INPUT ZA SLANJE */}
      <div className="p-5 border-t border-gray-800 bg-gray-900/50">
        <form onSubmit={handleSend} className="max-w-5xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder={`Napiši poruku korisniku ${chatPartnerName}...`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all text-white placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={!messageInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all shadow-lg active:scale-95 text-white"
          >
            Pošalji
          </button>
        </form>
      </div>
    </div>
  );
}