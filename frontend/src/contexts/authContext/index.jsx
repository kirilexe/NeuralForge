import React, {createContext, useContext, useState, useEffect} from 'react';
import {auth} from '../../firebase/firebase';
import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

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
    const [userloggedin, setUserloggedin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser(user); // Don't spread, use the user object directly
            setUserloggedin(true);
        } else {
            setCurrentUser(null);
            setUserloggedin(false);
        } 
        setLoading(false);
    }

    // Sign up function
    const signup = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result;
    };

    // Login function
    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result;
    };

    // Logout function
    const logout = async () => {
        await signOut(auth);
    };

    // Password reset function
    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email);
    };

    // Update password function with reauthentication
    const updateUserPassword = async (currentPassword, newPassword) => {
        if (!currentUser || !currentUser.email) {
            throw new Error('No user is currently signed in.');
        }

        try {
            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            
            // Then update password
            await updatePassword(currentUser, newPassword);
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    };

    // Optional: Update profile (display name, photo URL)
    const updateProfile = async (displayName, photoURL) => {
        if (!currentUser) {
            throw new Error('No user is currently signed in.');
        }

        await updateProfile(currentUser, {
            displayName,
            photoURL
        });
        
        // Update local state
        setCurrentUser({
            ...currentUser,
            displayName,
            photoURL
        });
    };

    const value = {
        currentUser, 
        userloggedin,
        loading,
        signup,
        login,
        logout,
        resetPassword,
        updateUserPassword,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}