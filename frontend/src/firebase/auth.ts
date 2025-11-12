import { auth } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword
} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import { db } from './firebase'

export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string,
  role: string = "user"
) => {
  // create user in firebase auth
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // save role in firestore
  try {
    await setDoc(doc(db, "users", userCred.user.uid), {
      email,
      role,
    });
  } catch (err) {
    console.error("Error setting user role in Firestore:", err);
  }

  return userCred;
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