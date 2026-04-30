// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore, CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate Config (Prevents silent internal-errors)
Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value && typeof window !== 'undefined') {
        console.error(`Firebase Error: ${key} is missing from environment variables.`);
    }
});

class FirebaseManager {
    private static instance: FirebaseManager;
    public readonly app: FirebaseApp;
    public readonly auth: Auth;
    public readonly db: Firestore;
    public readonly googleProvider: GoogleAuthProvider;

    private constructor() {
        // 1. Initialize App
        this.app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

        // 2. Initialize Auth with explicit persistence
        this.auth = getAuth(this.app);
        if (typeof window !== "undefined") {
            setPersistence(this.auth, browserLocalPersistence);
        }

        // 3. Initialize Firestore with Modern Persistent Cache (SDK v10+)
        // This is more robust than the old enableIndexedDbPersistence
        this.db = initializeFirestore(this.app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
                cacheSizeBytes: CACHE_SIZE_UNLIMITED
            })
        });

        // 4. Configure Provider
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });
    }

    public static getInstance(): FirebaseManager {
        if (!FirebaseManager.instance) {
            FirebaseManager.instance = new FirebaseManager();
        }
        return FirebaseManager.instance;
    }
}

// Export singletons
const instance = FirebaseManager.getInstance();
export const auth = instance.auth;
export const db = instance.db;
export const googleProvider = instance.googleProvider;
export default instance.app;
