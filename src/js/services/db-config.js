import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVGYIKAkNn5DgdHUK3PeZpj6xpO34UuAc",
  authDomain: "cinesync-1069f.firebaseapp.com",
  projectId: "cinesync-1069f",
  storageBucket: "cinesync-1069f.firebasestorage.app",
  messagingSenderId: "1083197513739",
  appId: "1:1083197513739:web:638aa4039c48155106a70e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);