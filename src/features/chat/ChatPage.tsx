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
      console.error("Greška pri učitavanju konverzacija:", err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchConversations().finally(() => setIsLoading(false));
  }, []);

  // Join all conversation rooms gradually to receive notifications
  useEffect(() => {
    if (!connection || conversations.length === 0) return;

    // Join conversations one at a time with 200ms delay
    conversations.forEach((conv, index) => {
      setTimeout(() => {
        const convId = String(conv.id).toLowerCase();
        connection.invoke("JoinConversation", convId).catch(() => {});
      }, index * 200);
    });
  }, [connection, conversations]);

  useEffect(() => {
    let isMounted = true;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5078/chatHub", {
        accessTokenFactory: () => {
          const token = document.cookie.split('; ')
            .find(row => row.startsWith('access-token='))
            ?.split('=')[1] || "";
          return token;
        }
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.start()
      .then(() => {
        if (isMounted) {
          setConnection(newConnection);
        }
      })
      .catch(err => console.error("SignalR connection error:", err));

    // Handle reconnection
    newConnection.onreconnecting(() => {
      setConnection(null);
    });

    newConnection.onreconnected(() => {
      if (isMounted) {
        setConnection(newConnection);
      }
    });

    newConnection.onclose(() => {
      setConnection(null);
    });

    return () => {
      isMounted = false;
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, []);

  // Set up SignalR listeners once when connection is established
  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (message: any) => {
      const incomingConvId = String(message.conversationId || message.ConversationId).toLowerCase();

      setSelectedConversation((prev: any) => {
        if (!prev) {
          // No conversation selected, mark as unread
          setUnreadConversations(unread => new Set(unread).add(incomingConvId));
          return prev;
        }

        const currentConvId = String(prev.id).toLowerCase();

        // Only add message if it's for the current conversation
        if (incomingConvId === currentConvId) {
          const messageId = message.id || message.Id;
          const alreadyExists = prev.messages?.some((m: any) => (m.id || m.Id) === messageId);
          if (alreadyExists) return prev;

          return {
            ...prev,
            messages: [...(prev.messages || []), message]
          };
        } else {
          // Message for different conversation, mark as unread
          setUnreadConversations(unread => new Set(unread).add(incomingConvId));
        }

        return prev;
      });

      // Update sidebar
      fetchConversations();
    };

    const handleMessagesRead = (convId: string) => {
      setSelectedConversation((prev: any) => {
        if (!prev) return prev;

        if (String(prev.id).toLowerCase() === convId.toLowerCase()) {
          // Refetch conversation to get updated read status
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

  // Join conversation and fetch messages only when user selects a new conversation
  useEffect(() => {
    const convId = selectedConversation?.id;
    if (!connection || !convId || convId === "undefined") return;

    const convIdStr = String(convId).toLowerCase();

    // Only fetch if this is a different conversation than what we had before
    if (selectedConvIdRef.current === convIdStr) return;

    selectedConvIdRef.current = convIdStr;

    // Join the SignalR room
    connection.invoke("JoinConversation", convIdStr)
      .catch((err: any) => console.error("Error joining conversation:", err));

    // Fetch messages only for existing conversations (not new ones)
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

        // Update ref if this is a new conversation being created
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

      // Update sidebar to show the new/updated conversation
      fetchConversations();
    }
  };

  const handleSelectConversation = (conv: any) => {
    // Reset the ref so the useEffect will fetch messages
    selectedConvIdRef.current = null;
    setSelectedConversation({ ...conv, isNew: false });

    // Mark conversation as read (remove from unread set)
    const convId = String(conv.id).toLowerCase();
    setUnreadConversations(unread => {
      const newUnread = new Set(unread);
      newUnread.delete(convId);
      return newUnread;
    });
  };

  const handleSelectUserFromSearch = (u: any) => {
    // Reset the ref for new conversation
    selectedConvIdRef.current = null;
    setSelectedConversation({ ...u, isNew: true, messages: [] });
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden font-sans">
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