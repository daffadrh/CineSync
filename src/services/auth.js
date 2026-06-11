import { auth } from '../js/services/db-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { getMyProfile, updateProfile as updateUserProfile } from './profile-service.js';

export async function registerUser(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    // Create the backend profile (and empty friend list) immediately, with the
    // displayName passed explicitly — the ID token's `name` claim won't reflect
    // the updateProfile() call above until the token is next refreshed.
    const token = await userCredential.user.getIdToken();
    await getMyProfile(token);
    if (displayName) {
        await updateUserProfile(token, { displayName });
    }

    return userCredential.user;
}

export async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
}

export async function logoutUser() {
    await signOut(auth);
}