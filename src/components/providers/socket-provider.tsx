"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io("http://127.0.0.1:3001", {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true,
        });

        socketInstance.on("connect", () => {
            console.log("Socket: Connected", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket: Connection Error", err.message);
            setIsConnected(false);
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("Socket: Disconnected", reason);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
