"use client";

import { Session, User } from "lucia";
import { createContext, useContext } from "react";

interface SessionContextTypes {
  user: User;
  session: Session;
}

const SessionContext = createContext<SessionContextTypes | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContextTypes }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(){
    const context = useContext(SessionContext);
    if(!context){
        throw new Error("useSession must be with in session provider")
    };
    return context;
}