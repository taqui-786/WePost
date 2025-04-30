"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "sonner";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null); 
  useEffect(() => {
    if (!session.user || socketRef.current) return;

    const socketInstance = io("http://localhost:3001", {
      auth: {
        username: session.user.username,
        userId: session.user.id
      },
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance); // set in state so context re-renders

    socketInstance.on("connect", () => {
      console.log("✅ Connected with id:", socketInstance.id);
      socketInstance.emit("user-joined", session.user);
    });

    socketInstance.on("user-joined-toast", (user) => {
      if (user.id !== session.user.id) {
        toast.info(`User is Active ${user?.username}`);
      }
    });

    socketInstance.on("your-post-liked", ({ from}) => {
      toast.success(`Your Post is Liked by ${from}`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session.user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
