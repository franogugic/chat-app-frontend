import { useState, useEffect, useRef } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatWindow } from "./components/ChatWindow";
import { getConversationById, getUserConversations, type ConversationResponse } from "../auth/api/conversation.api";
import { useAuth } from "../auth/context/useAuth";
import * as signalR from "@microsoft/signalr";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const selectedConvIdRef = useRef<string | null>(null);
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(new Set());

  const fetchConversations = async () => {
    try {
      const data = await getUserConversations();
      const convs = (data as any).conversations || data;
      setConversations(Array.isArray(convs) ? convs : []);
    } catch (err) {
      console.error("Error loading conversation:", err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchConversations().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!connection || conversations.length === 0) return;

    conversations.forEach((conv, index) => {
      setTimeout(() => {
        const convId = String(conv.id).toLowerCase();
        connection.invoke("JoinConversation", convId).catch(() => {});
      }, index * 200);
    });
  }, [connection, conversations]);

  useEffect(() => {
  let isMounted = true;

  const getAccessToken = () => {
    const name = "access-token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
  };

  const newConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5078/chatHub", {
      accessTokenFactory: () => getAccessToken(),
      skipNegotiation: false, 
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  const startConnection = async () => {
    try {
      if (newConnection.state === signalR.HubConnectionState.Disconnected) {
        await newConnection.start();
        if (isMounted) {
          console.log("SignalR Connected.");
          setConnection(newConnection);
        }
      }
    } catch (err) {
      console.error("SignalR connection error:", err);
      if (isMounted) {
        setTimeout(startConnection, 5000);
      }
    }
  };

  startConnection();

  newConnection.onreconnecting(() => setConnection(null));
  newConnection.onreconnected(() => isMounted && setConnection(newConnection));
  
  newConnection.onclose((error) => {
    if (isMounted) {
      setConnection(null);
      if (error) {
        console.warn("Connection closed with error, attempting restart...", error);
        startConnection();
      }
    }
  });

  return () => {
    isMounted = false;
    if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
      newConnection.stop();
    }
  };
}, []);

  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (message: any) => {
      const incomingConvId = String(message.conversationId || message.ConversationId).toLowerCase();

      setSelectedConversation((prev: any) => {
        if (!prev) {
          setUnreadConversations(unread => new Set(unread).add(incomingConvId));
          return prev;
        }

        const currentConvId = String(prev.id).toLowerCase();

        if (incomingConvId === currentConvId) {
          const messageId = message.id || message.Id;
          const alreadyExists = prev.messages?.some((m: any) => (m.id || m.Id) === messageId);
          if (alreadyExists) return prev;

          return {
            ...prev,
            messages: [...(prev.messages || []), message]
          };
        } else {
          setUnreadConversations(unread => new Set(unread).add(incomingConvId));
        }

        return prev;
      });

      fetchConversations();
    };

    const handleMessagesRead = (convId: string) => {
      setSelectedConversation((prev: any) => {
        if (!prev) return prev;

        if (String(prev.id).toLowerCase() === convId.toLowerCase()) {
          getConversationById(convId).then(data => {
            setSelectedConversation(current => current ? { ...current, ...data } : null);
          });
        }
        return prev;
      });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("MessagesRead", handleMessagesRead);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("MessagesRead", handleMessagesRead);
    };
  }, [connection]);

  useEffect(() => {
    const convId = selectedConversation?.id;
    if (!connection || !convId || convId === "undefined") return;

    const convIdStr = String(convId).toLowerCase();

    if (selectedConvIdRef.current === convIdStr) return;

    selectedConvIdRef.current = convIdStr;

    connection.invoke("JoinConversation", convIdStr)
      .catch((err: any) => console.error("Error joining conversation:", err));

    if (!selectedConversation.isNew) {
      getConversationById(convId)
        .then(data => {
          setSelectedConversation((prev: any) => ({
            ...prev,
            ...data,
            isNew: false
          }));
        })
        .catch(err => console.error("Error fetching messages:", err));
    }
  }, [connection, selectedConversation?.id, selectedConversation?.isNew]);

  const handleNewMessage = (sentMessage: any) => {
    if (sentMessage && sentMessage.conversationId) {
      setSelectedConversation((prev: any) => {
        if (!prev) return prev;

        const messageId = sentMessage.id || sentMessage.Id;
        const alreadyExists = prev.messages?.some((m: any) => (m.id || m.Id) === messageId);
        if (alreadyExists) return prev;

        const newConvId = sentMessage.conversationId;
        const isNewConversation = prev.isNew || prev.id !== newConvId;

        if (isNewConversation) {
          selectedConvIdRef.current = String(newConvId).toLowerCase();
        }

        return {
          ...prev,
          id: newConvId,
          isNew: false,
          messages: [...(prev?.messages || []), sentMessage]
        };
      });

      fetchConversations();
    }
  };

  const handleSelectConversation = (conv: any) => {

    selectedConvIdRef.current = null;
    setSelectedConversation({ ...conv, isNew: false });

    const convId = String(conv.id).toLowerCase();
    setUnreadConversations(unread => {
      const newUnread = new Set(unread);
      newUnread.delete(convId);
      return newUnread;
    });
  };

  const handleSelectUserFromSearch = (u: any) => {
  selectedConvIdRef.current = null;
  
  const existingConv = conversations.find(c => 
    c.participants?.some(p => String(p.userId).toLowerCase() === String(u.id).toLowerCase())
  );

  if (existingConv) {
    handleSelectConversation(existingConv);
  } else {
   setSelectedConversation({ 
      id: u.id, 
      name: u.name, 
      title: u.name, 
      isNew: false, 
      messages: [] 
    } as ConversationResponse);
  }
};

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        currentUser={user}
        logout={logout}
        onSelectConversation={handleSelectConversation}
        onSelectUserFromSearch={handleSelectUserFromSearch}
        loading={isLoading}
        selectedId={selectedConversation?.id}
        onSelect={() => {}}
        unreadConversations={unreadConversations}
      />

      <ChatWindow
        conversation={selectedConversation}
        currentUserId={user?.id}
        onNewMessage={handleNewMessage}
        connection={connection}
      />
    </div>
  );
}