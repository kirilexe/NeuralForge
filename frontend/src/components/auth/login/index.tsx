import React, { useState } from 'react';
import { doSignInWithEmailAndPassword, doSignOut } from '../../../firebase/auth';
//@ts-ignore
import { useAuth } from '../../../contexts/authContext/index';

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<any>(null);

	const {currentUser} = useAuth();
	
		if (currentUser) {
			return (
				<div style={{ maxWidth: 400, margin: 'auto', padding: 32, textAlign: 'center' }}>
					<h2>Already Logged In</h2>
					<p>You are already signed in. Please log out to register a new account.</p>
				</div>
			)
		}

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			const userCredential = await doSignInWithEmailAndPassword(email, password);
			setUser(userCredential.user);
		} catch (err: any) {
			setError(err.message);
		}
	};

	const handleLogout = async () => {
		await doSignOut();
		setUser(null);
	};

	return (
		<div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
			<h2>Login</h2>
			{user ? (
				<div>
					<p>Welcome, {user.email}!</p>
					<button onClick={handleLogout}>Sign Out</button>
				</div>
			) : (
				<form onSubmit={handleLogin}>
					<div style={{ marginBottom: 16 }}>
						<label>Email:</label>
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							style={{ width: '100%', padding: 8 }}
						/>
					</div>
					<div style={{ marginBottom: 16 }}>
						<label>Password:</label>
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							style={{ width: '100%', padding: 8 }}
						/>
					</div>
					{error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
					<button type="submit" style={{ width: '100%', padding: 10 }}>Login</button>
				</form>
			)}
		</div>
	);
};

export default LoginPage;