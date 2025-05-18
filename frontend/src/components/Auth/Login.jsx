import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../utils/Navbar';

const Login = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const response = await fetch('http://localhost:8000/check-login/', {
					credentials: 'include',
				});
				const data = await response.json();

				if (data.message === 'User is logged in') {
					navigate('/dashboard'); // Redirect to the dashboard or any other page
				}
			} catch (error) {
				console.error('Error checking login status:', error);
			}
		};

		checkLoginStatus();
	}, [navigate]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			const endpoint = 'http://localhost:8000/login/';
			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, email, password }),
			};

			const response = await fetch(endpoint, requestOptions);
			const data = await response.json();

			if (response.status === 200) {
				// Set the CSRF token and session ID in the cookies
				document.cookie = `csrftoken=${data.csrfToken}; path=/`;
				document.cookie = `sessionid=${data.sessionId}; path=/`;

				// Update session ID context
				// updateSessionId(data.sessionId);

				navigate('/dashboard'); // Redirect to the dashboard or any other page
			} else {
				// Handle login error
				console.error('Login failed:', data.message);
			}
		} catch (error) {
			// Display error message using JavaScript alert
			alert('An error occurred while logging in. Please try again.');
			console.error('Error:', error);
			// Refresh the page to handle the error
			window.location.reload();
		}
	};

	return (
		<div className="container">
			<Navbar />
			<div className="row">
				<h2 className="my-4">Chatnivo Login</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="username">Username</label>
						<input
							type="text"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							id="username"
							required
						/>
					</div>
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							id="email"
							required
						/>
					</div>
					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							id="password"
							required
						/>
					</div>
					<button type="submit" className="btn btn-primary">
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;