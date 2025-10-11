import React, {useContext, useState, useEffect} from 'react';
import { useEffect } from 'react';
import {auth} from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
    return React.useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [userloggedin, setUserloggedin] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(auth, initializeUser);
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