// Firebase is used for two things here:
// 1. Firestore — stores Stockline's shared inventory data (one document
//    per key) so it persists and stays in sync for everyone using the app.
//    A separate "stockline_public" collection holds only the approved
//    weekly deals, readable without signing in, for the public storefront.
// 2. Authentication — real login (email + password). Each account is
//    mapped to exactly one department/role in the "stockline_users"
//    collection, so people only ever see the features their account
//    was assigned.

import { initializeApp, deleteApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, query, limit,
} from "firebase/firestore";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword,
} from "firebase/auth";

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
const auth = getAuth(app);

const COLLECTION = "stockline_data";
const USERS_COLLECTION = "stockline_users";
const PUBLIC_COLLECTION = "stockline_public";
const normEmail = (email) => email.trim().toLowerCase();

// ---------- Shared inventory data (staff only, requires sign-in) ----------

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

// ---------- Public storefront data (anyone can read, no sign-in needed) ----------

export const publicStorage = {
  async get(key) {
    try {
      const snap = await getDoc(doc(db, PUBLIC_COLLECTION, key));
      if (!snap.exists()) return null;
      return { key, value: snap.data().value };
    } catch (err) {
      console.error("publicStorage.get failed:", err);
      return null;
    }
  },
  async set(key, value) {
    try {
      await setDoc(doc(db, PUBLIC_COLLECTION, key), { value, updatedAt: Date.now() });
      return { key, value };
    } catch (err) {
      console.error("publicStorage.set failed:", err);
      return null;
    }
  },
};

// ---------- Authentication ----------

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, normEmail(email), password);
}

export function logoutUser() {
  return signOut(auth);
}

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Create a brand-new staff login (email + password) without disturbing the
// Admin's own signed-in session. Firebase's client SDK normally signs you
// in as whichever account you just created — to avoid that, this spins up
// a short-lived *second* Firebase app just for the signup call, then tears
// it down immediately. The Admin stays signed in the whole time.
export async function createStaffAccount(email, password) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    await createUserWithEmailAndPassword(secondaryAuth, normEmail(email), password);
    await signOut(secondaryAuth);
    return { ok: true };
  } catch (err) {
    const messages = {
      "auth/email-already-in-use": "An account with that email already exists.",
      "auth/invalid-email": "That email address doesn't look right.",
      "auth/weak-password": "Password should be at least 6 characters.",
    };
    return { ok: false, message: messages[err.code] || "Couldn't create the account." };
  } finally {
    await deleteApp(secondaryApp);
  }
}

// Sends the user a link to set their own new password — the only way an
// Admin can help someone reset a forgotten password without a backend.
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, normEmail(email));
    return { ok: true };
  } catch (err) {
    return { ok: false, message: "Couldn't send the reset email." };
  }
}

// Lets the currently signed-in person change their own password.
export async function changeOwnPassword(newPassword) {
  try {
    if (!auth.currentUser) return { ok: false, message: "Not signed in." };
    await updatePassword(auth.currentUser, newPassword);
    return { ok: true };
  } catch (err) {
    const messages = {
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/requires-recent-login": "Please sign out and sign back in, then try again.",
    };
    return { ok: false, message: messages[err.code] || "Couldn't change the password." };
  }
}

// ---------- Email → department mapping ----------

export async function getUserRole(email) {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, normEmail(email)));
    if (!snap.exists()) return null;
    return snap.data().role || null;
  } catch (err) {
    console.error("getUserRole failed:", err);
    return null;
  }
}

export async function setUserRole(email, role) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, normEmail(email)), { role, email: normEmail(email) });
    return true;
  } catch (err) {
    console.error("setUserRole failed:", err);
    return false;
  }
}

export async function deleteUserRole(email) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, normEmail(email)));
    return true;
  } catch (err) {
    console.error("deleteUserRole failed:", err);
    return false;
  }
}

export async function listUserRoles() {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map((d) => ({ email: d.id, role: d.data().role }));
  } catch (err) {
    console.error("listUserRoles failed:", err);
    return [];
  }
}

// The very first person ever to sign in becomes Admin automatically,
// so there's always at least one account that can assign everyone else.
export async function isFirstUser() {
  try {
    const snap = await getDocs(query(collection(db, USERS_COLLECTION), limit(1)));
    return snap.empty;
  } catch (err) {
    console.error("isFirstUser failed:", err);
    return false;
  }
}
