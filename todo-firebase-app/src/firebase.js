import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "",
  authDomain: "to-do-app-21cfa.firebaseapp.com",
  projectId: "to-do-app-21cfa",
  storageBucket: "to-do-app-21cfa.firebasestorage.app",
  messagingSenderId: "763834783608",
  appId: "1:763834783608:web:4e69c9e29d2440310c5a8d",
  measurementId: "G-6H72CDN9NF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
