// Navbar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaBell } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import "../static/whisperer.css";
import NotificationProvider from '../components/NotificationProvider';

const Navbar = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userProfile, setUserProfile] = useState(null);
	const [currentPage, setCurrentPage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const response = await fetch('http://localhost:8000/check-login/', {
					credentials: 'include',
				});
				const data = await response.json();
				setIsAuthenticated(data.message === 'User is logged in');

				if (data.message === 'User is logged in') {
					const profileResponse = await fetch('http://localhost:8000/user-profile/', {
						credentials: 'include',
					});
					setUserProfile(await profileResponse.json());
				}
			} catch (error) {
				console.error('Error checking login status:', error);
			}
		};

		checkLoginStatus();
	}, []);

	useEffect(() => {
		setCurrentPage(location.pathname);
	}, [location.pathname]);

	const navigateToHome = async () => {
		await navigate('/dashboard');
	};

	const navigateToRegister = async () => {
		await navigate('/register');
	};

	const navigateToLogin = async () => {
		await navigate('/login');
	};

	const navigateToProfile = async () => {
		await navigate('/profile');
	};

	const navigateToChatrooms = async () => {
		await navigate('/chatrooms');
	};

	const navigateToCreateChatroom = async () => {
		await navigate('/create-chatroom');
	};

	const getCsrfToken = async () => {
		const response = await fetch('http://localhost:8000/get-csrf-token/', {
			credentials: 'include',
		});
		const { csrfToken } = await response.json();
		return csrfToken;
	};

	const logout = async () => {
		try {
			const csrfToken = await getCsrfToken();
			const response = await fetch('http://localhost:8000/logout/', {
				method: 'POST',
				headers: {
					'X-CSRFToken': csrfToken,
				},
				credentials: 'include',
			});

			if (response.ok) {
				document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				setIsAuthenticated(false);
				setUserProfile(null);
				await navigate('/dashboard');
			} else {
				console.error('Error logging out:', response.status);
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	};

	const triggerNotification = () => {
		// For demonstration purposes, you can manually trigger a notification
		toast('This is a test notification!');
	};

	return (
		<header>
			<nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar-vertical">
				<ul className="navbar-nav">
					{isAuthenticated && userProfile ? (
						currentPage !== '/profile' ? (
							<>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={navigateToProfile}>
										{userProfile.username}
									</button>
								</li>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={navigateToHome}>
										Home
									</button>
								</li>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={navigateToChatrooms}>
										Chatrooms
									</button>
								</li>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={navigateToCreateChatroom}>
										Create Chatroom
									</button>
								</li>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={logout}>
										Logout
									</button>
								</li>
								<li className="nav-item">
									{/* Display Bell Icon for notifications */}
									<button className="btn btn-link nav-link" onClick={triggerNotification}>
										<FaBell />
									</button>
								</li>
							</>
						) : (
							<>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={navigateToHome}>
										Home
									</button>
								</li>
								<li className="nav-item">
									<button className="btn btn-link nav-link" onClick={logout}>
										Logout
									</button>
								</li>
							</>
						)
					) : (
						<>
							{currentPage === '/register' ? (
								<>
									<li className="nav-item">
										<button className="btn btn-link nav-link" onClick={navigateToHome}>
											Home
										</button>
									</li>
									<li className="nav-item">
										<button className="btn btn-link nav-link" onClick={navigateToLogin}>
											Login
										</button>
									</li>
								</>
							) : currentPage === '/login' ? (
								<>
									<li className="nav-item">
										<button className="btn btn-link nav-link" onClick={navigateToHome}>
											Home
										</button>
									</li>
									<li className="nav-item">
										<button className="btn btn-link nav-link" onClick={navigateToRegister}>
											Register
										</button>
									</li>
								</>
							) : (
								<>
									<li className="nav-item">
										<button className="btn btn-link nav-link" onClick={navigateToRegister}>
											Register
										</button>
									</li>
									<li className="nav-item">
										<button className="btn btn-link nav-link" onClick={navigateToLogin}>
											Login
										</button>
									</li>
								</>
							)}
						</>
					)}
				</ul>
			</nav>
			<ToastContainer />
			{/* NotificationProvider handles WebSocket notifications */}
			<NotificationProvider />
		</header>
	);
};

export default Navbar;