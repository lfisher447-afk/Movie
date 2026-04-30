
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore, CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // <-- FIXED: Now uses your exact env variable
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

class FirebaseManager {
    private static instance: FirebaseManager;
    public readonly app: FirebaseApp;
    public readonly auth: Auth;
    public readonly db: Firestore;
    public readonly googleProvider: GoogleAuthProvider;
    public analytics?: Analytics;

    private constructor() {
        // 1. Initialize App safely
        this.app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

        // 2. Initialize Auth
        this.auth = getAuth(this.app);
        
        // 3. SSR & HMR Safe Local Cache
        if (typeof window !== "undefined") {
            setPersistence(this.auth, browserLocalPersistence).catch(console.error);
            
            try {
                this.db = initializeFirestore(this.app, {
                    localCache: persistentLocalCache({
                        tabManager: persistentMultipleTabManager(),
                        cacheSizeBytes: CACHE_SIZE_UNLIMITED
                    })
                });
            } catch (e) {
                // Fallback if HMR causes double initialization
                this.db = getFirestore(this.app);
            }
        } else {
            // Server-side initialization
            this.db = getFirestore(this.app);
        }

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

const instance = FirebaseManager.getInstance();
export const auth = instance.auth;
export const db = instance.db;
export const googleProvider = instance.googleProvider;
export const analytics = instance.analytics;
export default instance.app;
