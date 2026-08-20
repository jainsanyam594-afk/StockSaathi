import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZG5eYgv-pHDiS6E4Fe9lMaszdIhu-Xks",
  authDomain: "stocksaathi-a81b0.firebaseapp.com",
  projectId: "stocksaathi-a81b0",
  storageBucket: "stocksaathi-a81b0.firebasestorage.app",
  messagingSenderId: "458798735166",
  appId: "1:458798735166:web:ecd98d602c5737d943166f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);