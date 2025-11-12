import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../firebase/firebase';
import { db } from '../../firebase/firebase'; // add this import
import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 🔥 added
  const [userloggedin, setUserloggedin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser(user);
      setUserloggedin(true);

      // Fetch user role from Firestore
      const role = await fetchUserRole(user.uid);
      setUserRole(role);
    } else {
      setCurrentUser(null);
      setUserRole(null);
      setUserloggedin(false);
    }
    setLoading(false);
  }

  // Helper to get user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role || 'user';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
    return 'user';
  };

  // Sign up
  const signup = async (email, password, role = 'user') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Save role to Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      role,
    });

    setUserRole(role);
    return result;
  };

  // Login
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const role = await fetchUserRole(result.user.uid);
    setUserRole(role);
    return result;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  // Reset password
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update password
  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!currentUser?.email) throw new Error('No user is currently signed in.');
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  // Update profile
  const updateUserProfile = async (displayName, photoURL) => {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
