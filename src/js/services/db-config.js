import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhb6k8vrMeYDPI5gSBKjEfEGn5VL2z8-U",
  authDomain: "imk-fp.firebaseapp.com",
  projectId: "imk-fp",
  storageBucket: "imk-fp.firebasestorage.app",
  messagingSenderId: "226271537087",
  appId: "1:226271537087:web:1ce04993be8d9a9ebda30a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);