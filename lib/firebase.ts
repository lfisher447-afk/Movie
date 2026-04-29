// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Advanced Singleton with Type Safety
class FirebaseService {
    private static instance: FirebaseService;
    public app: FirebaseApp;
    public auth: Auth;
    public db: Firestore;
    public googleProvider: GoogleAuthProvider;

    private constructor() {
        this.app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });
        
        // Enable Offline Persistence for High Performance
        if (typeof window !== "undefined") {
            enableIndexedDbPersistence(this.db).catch((err) => {
                if (err.code === 'failed-precondition') console.warn("Multiple tabs open, persistence disabled.");
            });
        }
    }

    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) FirebaseService.instance = new FirebaseService();
        return FirebaseService.instance;
    }
}

export const firebase = FirebaseService.getInstance();
export const { auth, db, googleProvider } = firebase;
