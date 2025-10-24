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
			<div style={{ maxWidth: 400, margin: 'auto', padding: 32, textAlign: 'center' }}>
				<h2>Already Logged In</h2>
				<p>You are already signed in. Please log out to register a new account.</p>
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
		<div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
			<h2>Register</h2>
			{success ? (
				<div style={{ color: 'green' }}>
					<p>Registration successful! You can now login.</p>
				</div>
			) : (
				<form onSubmit={handleRegister}>
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
					<div style={{ marginBottom: 16 }}>
						<label>Confirm Password:</label>
						<input
							type="password"
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							required
							style={{ width: '100%', padding: 8 }}
						/>
					</div>
					{error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
					<button type="submit" style={{ width: '100%', padding: 10 }}>Register</button>
				</form>
			)}
		</div>
	);
};

export default RegisterPage;