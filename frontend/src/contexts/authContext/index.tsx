import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../firebase/firebase';
import { db } from '../../firebase/firebase';
import type { User } from "firebase/auth";

import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const AuthContext = createContext<any>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userloggedin, setUserloggedin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser(user);
      setUserloggedin(true);
      const role = await fetchUserRole(user.uid);
      setUserRole(role);
    } else {
      setCurrentUser(null);
      setUserRole(null);
      setUserloggedin(false);
    }
    setLoading(false);
  }

  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) return userDoc.data().role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
    return 'user';
  };

  const signup = async (email: string, password: string, role = 'user') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), { email, role });
    setUserRole(role);
    return result;
  };

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const role = await fetchUserRole(result.user.uid);
    setUserRole(role);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const deleteUserData = async (uid: string) => {
    // Delete all documents in "models" subcollection
    const modelsRef = collection(db, `users/${uid}/models`);
    const snapshot = await getDocs(modelsRef);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(modelsRef, docSnap.id));
    }

    // Delete root user document
    await deleteDoc(doc(db, 'users', uid));
  };

  const deleteAccount = async (password: string) => {
    if (!currentUser || !currentUser.email) throw new Error("No user is currently signed in.");

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    const uid = currentUser.uid;

    // Delete Firestore user data
    await deleteUserData(uid);

    // Delete Auth user
    await currentUser.delete();
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser?.email) throw new Error('No user is currently signed in.');
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    await fbUpdateProfile(currentUser, { displayName, photoURL });
    setCurrentUser({ ...currentUser, displayName, photoURL });
  };

  const value = {
    currentUser,
    userRole,
    userloggedin,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
