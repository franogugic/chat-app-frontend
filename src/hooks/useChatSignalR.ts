import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export const useChatSignalR = (conversationId: string | null) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5001/chatHub", {
                accessTokenFactory: () => {
                    return document.cookie.split('; ')
                        .find(row => row.startsWith('access-token='))
                        ?.split('=')[1] || "";
                }
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log("Connected to SignalR!");
                    
                    if (conversationId) {
                        connection.invoke("JoinConversation", conversationId);
                    }
                })
                .catch(err => console.error("SignalR Connection Error: ", err));
        }
        
        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [connection, conversationId]);

    return connection;
};