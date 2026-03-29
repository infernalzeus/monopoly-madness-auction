import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCG_hygUI6CM03A9mjJ_RZhV9Lix4LqEo0",
  authDomain: "monopoly-madness.firebaseapp.com",
  projectId: "monopoly-madness",
  storageBucket: "monopoly-madness.firebasestorage.app",
  messagingSenderId: "337702570922",
  appId: "1:337702570922:web:68c370ebfa3f2b59eb39d3",
  measurementId: "G-WSEGQM9G2D"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
