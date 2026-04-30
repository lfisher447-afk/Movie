// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore, CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Your Integrated Production Credentials
const firebaseConfig = {
    apiKey: "AIzaSyCJiYLU_Zz0vsJnNb2tsIz3zMIv5fHuHCY",
    authDomain: "://firebaseapp.com",
    databaseURL: "https://firebaseio.com",
    projectId: "jamal-a37a3",
    storageBucket: "jamal-a37a3.firebasestorage.app",
    messagingSenderId: "135022053090",
    appId: "1:135022053090:web:bcc293d922f322894480bb",
    measurementId: "G-LDP598FPXN"
};

/**
 * FirebaseManager Singleton
 * 10x Better: Handles SSR, Multi-tab persistence, and Hot Module Replacement (HMR) safety.
 */
class FirebaseManager {
    private static instance: FirebaseManager;
    public readonly app: FirebaseApp;
    public readonly auth: Auth;
    public readonly db: Firestore;
    public readonly googleProvider: GoogleAuthProvider;
    public analytics?: Analytics;

    private constructor() {
        // 1. Initialize App safely (prevents "[DEFAULT] already exists" errors)
        this.app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

        // 2. Initialize Auth with Browser Persistence
        this.auth = getAuth(this.app);
        if (typeof window !== "undefined") {
            setPersistence(this.auth, browserLocalPersistence);
        }

        // 3. Advanced Firestore Cache (Handles multiple tabs and offline mode)
        this.db = initializeFirestore(this.app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
                cacheSizeBytes: CACHE_SIZE_UNLIMITED
            })
        });

        // 4. Configure Google Auth Provider
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });

        // 5. Safe Analytics Initialization
        if (typeof window !== "undefined") {
            isSupported().then(supported => {
                if (supported) this.analytics = getAnalytics(this.app);
            });
        }
    }

    public static getInstance(): FirebaseManager {
        if (!FirebaseManager.instance) {
            FirebaseManager.instance = new FirebaseManager();
        }
        return FirebaseManager.instance;
    }
}

// Export singletons for use across your application
const instance = FirebaseManager.getInstance();
export const auth = instance.auth;
export const db = instance.db;
export const googleProvider = instance.googleProvider;
export const analytics = instance.analytics;
export default instance.app;
