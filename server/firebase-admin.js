import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = JSON.parse(
    readFileSync(new URL('./service-account.json', import.meta.url))
);

const app = initializeApp({
    credential: cert(serviceAccount)
});

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);