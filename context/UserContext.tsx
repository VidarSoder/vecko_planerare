'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { signInWithUserToken } from '@/components/firebase/firestore';

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    if ((user as any)?.accessToken) {
        signInWithUserToken((user as any))
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};