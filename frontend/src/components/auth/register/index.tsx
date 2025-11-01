import React, { useState } from 'react';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
//@ts-ignore
import { useAuth } from '../../../contexts/authContext/index';

const RegisterPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const {currentUser} = useAuth();

	if (currentUser) {
		return (
			<div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
				<div className="max-w-md w-full p-8 space-y-6 bg-gray-900 rounded-lg border border-purple-900/30 shadow-lg shadow-purple-950/50 text-center">
					<h2 className="text-2xl font-semibold text-purple-100">Already Logged In</h2>
					<p className="text-gray-300">You are already signed in. Please log out to register a new account.</p>
				</div>
			</div>
		)
	}

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		
		if (password !== confirmPassword) {
			setError("Passwords don't match");
			return;
		}

		if (password.length < 6) {
			setError("Password should be at least 6 characters");
			return;
		}

		try {
			await doCreateUserWithEmailAndPassword(email, password);
			setSuccess(true);
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
			<div className="max-w-md w-full p-8 space-y-6 bg-gray-900 rounded-lg border border-purple-900/30 shadow-lg shadow-purple-950/50">
				<h1 className="text-2xl font-semibold text-purple-100">Register</h1>
				{success ? (
					<div className="p-4 bg-green-950 border border-green-900 text-green-300 rounded-md">
						<p>Registration successful! You can now login.</p>
					</div>
				) : (
					<form onSubmit={handleRegister} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1.5">
								Email
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								className="w-full px-3 py-2.5 bg-gray-950 border border-purple-900/40 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-purple-700 transition"
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-1.5">
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								className="w-full px-3 py-2.5 bg-gray-950 border border-purple-900/40 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-purple-700 transition"
							/>
						</div>
						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-1.5">
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								required
								className="w-full px-3 py-2.5 bg-gray-950 border border-purple-900/40 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-purple-700 transition"
							/>
						</div>
						{error && <div className="p-3 bg-red-950 border border-red-900 text-red-300 rounded-md text-sm">{error}</div>}
						<button 
							type="submit"
							className="w-full py-2.5 rounded-md font-medium transition bg-purple-600 text-white hover:bg-purple-500 border border-purple-500"
						>
							Register
						</button>
					</form>
				)}
			</div>
		</div>
	);
};

export default RegisterPage;