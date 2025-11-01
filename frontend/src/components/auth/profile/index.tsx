//@ts-ignore
import { useAuth } from '../../../contexts/authContext/index';
import React, { useState } from 'react';

const ProfilePage = () => {
  const { currentUser, updateUserPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
//@ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!currentPassword) {
      return setError("Current password is required.");
    }

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }

    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters long.");
    }

    try {
      setMessage('');
      setError('');
      setLoading(true);

      // Use the updateUserPassword function from auth context
      await updateUserPassword(currentPassword, newPassword);

      setMessage("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Password update error:", err);
      //@ts-ignore
      switch (err.code) {
        case 'auth/wrong-password':
          setError("Current password is incorrect.");
          break;
        case 'auth/requires-recent-login':
          setError("For security reasons, please log in again and try updating your password.");
          break;
        case 'auth/weak-password':
          setError("New password is too weak. Please choose a stronger password.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your connection and try again.");
          break;
        default:
            //@ts-ignore
          setError(err.message || "Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="black-purple-hover-div w-150 h-auto mb-2">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-indigo-200">
          Your Profile
        </h1>

        {/* User Info Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-indigo-300 border-b border-indigo-700 pb-2">
            Account Details
          </h2>
          
          <div className="p-4 bg-indigo-800/40 rounded-lg">
            <p className="text-gray-200 text-lg mt-2">
              <span className="font-medium text-indigo-400">Email:</span> 
              <span className="ml-2">
                {currentUser ? currentUser.email : 'Loading...'}
              </span>
            </p>
            <p className="text-gray-200 mt-2 text-xs">
              Last login: {currentUser?.metadata?.lastSignInTime 
                ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() 
                : 'N/A'
              }
            </p>
          </div>
        </section>

        {/* Password Change Form Section */}
        <section className="space-y-6 pt-4 border-t border-indigo-700">
          <h2 className="text-xl font-semibold text-indigo-300">
            Change Password
          </h2>

          {/* Messages */}
          {message && (
            <div className="p-3 bg-green-900/50 border border-green-500 text-green-300 rounded-lg text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 content-center">
            
            {/* Current Password Input */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-indigo-300 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-900 border border-indigo-700 rounded-lg text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                placeholder="Enter your current password"
              />
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-indigo-300 mb-1">
                New Password *
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="w-full px-4 py-2 bg-gray-900 border border-indigo-700 rounded-lg text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-indigo-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="w-full px-4 py-2 bg-gray-900 border border-indigo-700 rounded-lg text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                placeholder="Confirm new password"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`py-3 rounded-lg font-semibold transition duration-200 ease-in-out justify-center
                ${loading 
                  ? 'btn-transparent-white w-20px opacity-50 cursor-not-allowed' 
                  : 'btn-transparent-white w-20px'
                }`}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;