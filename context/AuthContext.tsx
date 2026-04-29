// context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthNexusProps {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthNexus = createContext<AuthNexusProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = async () => {
        try { await signInWithPopup(auth, googleProvider); }
        catch (e) { console.error("Nexus Auth Error:", e); }
    };

    const logOut = async () => {
        try { await signOut(auth); window.location.href = "/"; }
        catch (e) { console.error("Nexus Signout Error:", e); }
    };

    return (
        <AuthNexus.Provider value={{ user, loading, signIn, logOut }}>
            {children}
        </AuthNexus.Provider>
    );
};

export const useNexusAuth = () => {
    const context = useContext(AuthNexus);
    if (!context) throw new Error("useNexusAuth must be used within an AuthProvider");
    return context;
};
