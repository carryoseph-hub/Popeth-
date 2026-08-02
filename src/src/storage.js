import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION = "stockline_data";

export const storage = {
  async get(key) {
    try {
      const snap = await getDoc(doc(db, COLLECTION, key));
      if (!snap.exists()) return null;
      return { key, value: snap.data().value, shared: true };
    } catch (err) {
      console.error("storage.get failed:", err);
      return null;
    }
  },
  async set(key, value) {
    try {
      await setDoc(doc(db, COLLECTION, key), { value, updatedAt: Date.now() });
      return { key, value, shared: true };
    } catch (err) {
      console.error("storage.set failed:", err);
      return null;
    }
  },
};
