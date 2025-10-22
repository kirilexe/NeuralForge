import React, { useEffect } from 'react';
import { auth } from '../../../firebase/firebase';
import { signOut } from 'firebase/auth';

interface SignOutPageProps {
  setCurrentPage: (page: string) => void;
}

const SignOutPage: React.FC<SignOutPageProps> = ({ setCurrentPage }) => {
    useEffect(() => {
        const performSignOut = async () => {
            try {
                await signOut(auth);
                setCurrentPage('home');
            } catch (error) {
                console.error('Error signing out:', error);
                setCurrentPage('home');
            }
        };

        performSignOut();
    }, [setCurrentPage]);

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 32, textAlign: 'center' }}>
            <h2>Signing Out...</h2>
            <p>Please wait while we sign you out.</p>
        </div>
    );
};

export default SignOutPage;