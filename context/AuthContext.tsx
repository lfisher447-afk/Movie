'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    User, 
    setPersistence, 
    browserLocalPersistence 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import toast from 'react-hot-toast';

// 10X STRICT TYPING
interface AuthNexusProps {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;   // Named to match your app/profile/page.tsx
    logout: () => Promise<void>;  // Named to match your app/profile/page.tsx
}

// Ensure context starts undefined to enforce proper boundary usage
const AuthNexus = createContext<AuthNexusProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Enforce browser-wide persistence so sessions survive tab closures
        setPersistence(auth, browserLocalPersistence).catch((e) => {
            console.error("Nexus Persistence Protocol Failed:", e);
        });

        // Listen to the session stream
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    },[]);

    const login = async () => {
        try { 
            const payload = await signInWithPopup(auth, googleProvider); 
            // Extract a cool display name, fallback to "Agent"
            const agentName = payload.user.displayName?.split(' ')[0] || 'Agent';
            toast.success(`Nexus Synced. Welcome, ${agentName}`);
        } 
        catch (e: any) { 
            console.error("Nexus Auth Relay Error:", e); 
            toast.error(e.message || "Authentication Blocked by Firewall");
        }
    };

    const logout = async () => {
        try { 
            await signOut(auth); 
            toast.success("Connection Severed");
            
            // Hard push to home screen to wipe any visual cache or memory hooks
            setTimeout(() => {
                window.location.href = "/";
            }, 600);
        } 
        catch (e: any) { 
            console.error("Nexus Signout Error:", e); 
            toast.error("Failed to decouple from Nexus.");
        }
    };

    return (
        <AuthNexus.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthNexus.Provider>
    );
};

// ADVANCED HOOK ERROR ENFORCEMENT
export const useAuth = () => {
    const context = useContext(AuthNexus);
    
    // This strictly prevents the app from destroying itself if the
    // context is accessed outside the layout boundary.
    if (context === undefined) {
        throw new Error("FATAL EXCEPTION: useAuth must be executed within an <AuthProvider> wrapper.");
    }
    
    return context;
};
