import { auth } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword
} from 'firebase/auth';

export const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = async () => {
    return await signOut(auth);
};

export const doPasswordReset = async (email: string) => {
    return await sendPasswordResetEmail(auth, email);
};

export const doPasswordUpdate = async (password: string) => {
    if (auth.currentUser) {
        return await updatePassword(auth.currentUser, password);
    }
    throw new Error('No user is currently signed in.');
};