import React, {useContext, useState, useEffect} from 'react';
import {auth} from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userloggedin, setUserloggedin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fix: Remove the extra 'auth' parameter
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, [])

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({...user});
            setUserloggedin(true);
        } else {
            setCurrentUser(null);
            setUserloggedin(false);
        } 
        setLoading(false);
    }

    const value = {
        currentUser, 
        userloggedin,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}