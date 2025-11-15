//@ts-ignore
import { useAuth } from '../../../contexts/authContext/index';
import React, { useState } from 'react';

const ProfilePage = () => {
  const { currentUser, userRole, updateUserPassword, deleteAccount } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [deleteError, setDeleteError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  //@ts-ignore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) return setError("Current password is required.");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    if (newPassword.length < 6) return setError("New password must be at least 6 characters long.");

    try {
      setError('');
      setMessage('');
      setLoading(true);

      await updateUserPassword(currentPassword, newPassword);

      setMessage("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      switch (errorObj.code) {
        case 'auth/wrong-password':
          setError("Current password is incorrect.");
          break;
        case 'auth/requires-recent-login':
          setError("Please log in again and try updating your password.");
          break;
        case 'auth/weak-password':
          setError("New password is too weak.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Check your connection and try again.");
          break;
        default:
          setError(errorObj.message || "Failed to update password. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  //@ts-ignore
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deletePassword) return setDeleteError("Password is required to delete your account.");

    try {
      setDeleteError('');
      setDeleteMessage('');
      setDeleteLoading(true);

      await deleteAccount(deletePassword);

      setDeleteMessage("Your account has been deleted.");
      setDeletePassword('');
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      switch (errorObj.code) {
        case 'auth/wrong-password':
          setDeleteError("Password is incorrect.");
          break;
        case 'auth/requires-recent-login':
          setDeleteError("Please log in again and try deleting your account.");
          break;
        case 'auth/network-request-failed':
          setDeleteError("Network error. Try again.");
          break;
        default:
          setDeleteError(errorObj.message || "Failed to delete account.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="black-purple-hover-div w-full max-w-md p-6 rounded-xl space-y-6">

        <h1 className="text-3xl font-bold text-center text-indigo-200">
          Your Profile
        </h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-indigo-300 border-b border-indigo-700 pb-2">
            Account Details
          </h2>

          <div className="p-4 bg-indigo-800/40 rounded-lg space-y-2">
            <p className="text-gray-200 text-sm">
              <span className="font-medium text-indigo-400">Email:</span> {currentUser?.email || 'Loading...'}
            </p>
            <p className="text-gray-200 text-sm">
              <span className="font-medium text-indigo-400">Role:</span> 
              <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium text-purple-300 
                             bg-purple-500/10 border border-purple-700/30 shadow-[0_0_6px_rgba(168,85,247,0.25)] select-none">
                {userRole === 'admin' ? 'Admin' : 'User'}
              </span>
            </p>
            <p className="text-gray-400 text-xs">
              Last login: {currentUser?.metadata?.lastSignInTime 
                ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() 
                : 'N/A'}
            </p>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-indigo-700">
          <h2 className="text-xl font-semibold text-indigo-300">
            Change Password
          </h2>

          {message && (
            <div className="p-2 bg-green-900/50 border border-green-500 text-green-300 rounded-md text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-2 bg-red-900/50 border border-red-500 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-900 border border-indigo-700 rounded-lg text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              className="w-full px-3 py-2 bg-gray-900 border border-indigo-700 rounded-lg text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              className="w-full px-3 py-2 bg-gray-900 border border-indigo-700 rounded-lg text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className={`btn-transparent-white w-full py-2 font-semibold rounded-lg text-center transition duration-200 ease-in-out
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="space-y-4 pt-4 border-t border-indigo-700">
          <h2 className="text-xl font-semibold text-indigo-300">
            Delete Account
          </h2>

          {deleteMessage && (
            <div className="p-2 bg-green-900/50 border border-green-500 text-green-300 rounded-md text-sm">
              {deleteMessage}
            </div>
          )}
          {deleteError && (
            <div className="p-2 bg-red-900/50 border border-red-500 text-red-300 rounded-md text-sm">
              {deleteError}
            </div>
          )}

          <form onSubmit={handleDelete} className="space-y-3">
            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleteLoading}
              className="w-full px-3 py-2 bg-gray-900 border border-red-700 rounded-lg text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={deleteLoading}
              className={`w-full py-2 font-semibold rounded-lg text-center transition duration-200 ease-in-out border border-red-700 text-red-300 hover:bg-red-800/40
                ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default ProfilePage;
