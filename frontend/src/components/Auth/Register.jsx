import React, { useState, useEffect } from 'react';
import Navbar from '../../utils/Navbar';
import { useNavigate } from 'react-router-dom';

const Register = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [errors, setErrors] = useState({});
	const [passwordSuccess, setPasswordSuccess] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const response = await fetch('http://localhost:8000/check-login/', {
					credentials: 'include'
				});
				const data = await response.json();
				setIsAuthenticated(data.message === 'User is logged in');

				// Redirect if user is authenticated
				if (isAuthenticated) {
					navigate('/dashboard'); // Redirect to the dashboard or any other page
				}
			} catch (error) {
				console.error('Error checking login status:', error);
			}
		};

		checkLoginStatus();
	}, [navigate, isAuthenticated]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			const endpoint = 'http://localhost:8000/register/';
			const requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password, firstName, lastName, email })
			};

			const response = await fetch(endpoint, requestOptions);
			const data = await response.json();

			if (response.status === 201) {
				await navigate('/login/');
			} else {
				setErrors(data.body);
				console.log(data);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	};

	const validatePassword = () => {
		if (password.length < 8) {
			setErrors((prevErrors) => ({ ...prevErrors, password: 'Password must be at least 8 characters' }));
			setPasswordSuccess(false);
		} else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*#?&.,_])[A-Za-z\d@$#%*?&.,_]{8,}$/)) {
			setErrors((prevErrors) => ({ ...prevErrors, password: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character' }));
			setPasswordSuccess(false);
		} else {
			setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
			setPasswordSuccess(true);
		}
	};

	return (
		<div className="container">
			<Navbar />
			<div className="row">
				<h2 className="my-4">Register</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-row">
						<div className="form-group col-md-6">
							<label htmlFor="name">Name:</label>
							<input
								className="form-control mb-3"
								type="text"
								placeholder="Name"
								value={firstName}
								onChange={(event) => setFirstName(event.target.value)}
							/>
							{errors && errors.name && (
								<p className="text-danger">{errors.name}</p>
							)}
						</div>
						<div className="form-group col-md-6">
							<label htmlFor="surname">Surname:</label>
							<input
								className="form-control mb-3"
								type="text"
								placeholder="Surname"
								value={lastName}
								onChange={(event) => setLastName(event.target.value)}
							/>
							{errors && errors.surname && (
								<p className="text-danger">{errors.surname}</p>
							)}
						</div>
					</div>
					<div className="form-group">
						<label htmlFor="email">Email:</label>
						<input
							className="form-control mb-3"
							type="email"
							placeholder="Email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
						{errors && errors.email && (
							<p className="text-danger">{errors.email}</p>
						)}
					</div>
					<div className="form-group">
						<label htmlFor="username">Username:</label>
						<input
							className="form-control mb-3"
							type="text"
							placeholder="Username"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
						/>
						{errors && errors.username && (
							<p className="text-danger">{errors.username}</p>
						)}
					</div>
					<div className="form-group">
						<label htmlFor="password">Password:</label>
						<input
							className="form-control mb-3"
							type="password"
							placeholder="Password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							onInput={validatePassword}
						/>
						{errors && errors.password && (
							<p className="text-danger">{errors.password}</p>
						)}
						{passwordSuccess && (
							<p className="text-success">Password is strong!</p>
						)}
					</div>
					<button className="btn btn-primary" type="submit">
						Register
					</button>
				</form>
			</div>
		</div>
	);
};

export default Register;