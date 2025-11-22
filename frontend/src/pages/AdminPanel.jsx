import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

const adminDeleteAccount = async (targetUid) => {
    if (!targetUid) {
        throw new Error("Target user ID is required for deletion.");
    }

    const functions = getFunctions();
    const deleteUserFunction = httpsCallable(functions, 'adminDeleteUser');

    try {
        const result = await deleteUserFunction({ uid: targetUid });
        console.log('User deleted successfully:', result.data);
        return { success: true, message: result.data.message };
    } catch (error) {
        console.error("Admin user deletion failed:", error);
        throw new Error(`Failed to delete account: ${error.message || 'Check Cloud Function logs.'}`);
    }
};

function UserTable({ users, onDeleteUser, isDeleting }) {
    const handleDelete = (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.email}? This action is permanent.`)) {
            onDeleteUser(user);
        }
    };

    return (
        <div className="overflow-x-auto rounded-md border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead>
                    <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-[#283149]">
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map(user => (
                        <tr 
                            key={user.id} 
                            className="text-white hover:bg-[#283149] transition duration-150"
                        >
                            <td className="px-4 py-4">{user.email}</td>
                            <td className="px-4 py-4">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    user.role === 'admin' 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-gray-600 text-gray-300'
                                }`}>
                                    {user.role || 'standard'}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <button 
                                    onClick={() => handleDelete(user)}
                                    disabled={isDeleting}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all duration-200 ${
                                        isDeleting
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-red-700/50 hover:bg-red-700'
                                    }`}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);

    useEffect(() => {
        const usersCollectionRef = collection(db, "users");
        
        const unsubscribe = onSnapshot(
            usersCollectionRef,
            (snapshot) => {
                const usersList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersList);
                setIsLoading(false);
            },
            (err) => {
                console.error("Error fetching users:", err);
                setError("Failed to load user data.");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleDeleteUser = async (user) => {
        setIsDeleting(true);
        setDeleteMessage(null);
        try {
            await adminDeleteAccount(user.id);
            setDeleteMessage({ type: 'success', text: `User ${user.email} deleted successfully.` });
        } catch (err) {
            setDeleteMessage({ type: 'error', text: err.message || 'An unknown error occurred during deletion.' });
        } finally {
            setIsDeleting(false);
            setTimeout(() => setDeleteMessage(null), 5000);
        }
    };

    return (
        <div className="bg-[#1e2538] rounded-md p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20v-2c0-.214-.016-.425-.045-.632M10 12l2-2m0 0l2 2m-2-2v8m-4-8v8a4 4 0 004 4h4a4 4 0 004-4v-8m-4-8l2 2m0 0l2-2m-2 2v-8m-4 8v-8a4 4 0 004 4h4a4 4 0 004-4v-8" />
                </svg>
                <h2 className="text-xl font-semibold text-white">Admin Panel: User Management</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">Manage users and access roles ({users.length} total).</p>

            {deleteMessage && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                    deleteMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {deleteMessage.text}
                </div>
            )}
            
            {isLoading ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                    <p className="text-gray-400 text-sm">Loading user data...</p>
                </div>
            ) : error ? (
                <div className="text-center py-6 border-2 border-dashed border-red-500/50 rounded-lg bg-red-900/10">
                    <p className="text-red-400 text-sm">Error: {error}</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354l.354.354m-2.708 0l-.354.354M12 4.354a8 8 0 00-7.646 9.646l.707.707m0 0l-.707.707M12 4.354h.001M12 4.354v.001m0 0l.354.354m-2.708 0l-.354.354m-.354-.354l.354-.354M12 4.354v.001M12 4.354h.001" />
                    </svg>
                    <p className="text-gray-400 text-sm">No users found in the database.</p>
                </div>
            ) : (
                <UserTable 
                    users={users} 
                    onDeleteUser={handleDeleteUser} 
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}

export default AdminPanel;