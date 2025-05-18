// NotificationProvider.jsx

import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationProvider = () => {
	useEffect(() => {
		// Connect to WebSocket server
		const socket = new WebSocket('ws://localhost:8000/ws/notifications/');

		// Handle incoming messages
		socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			if (data.type === 'notification') {
				toast(data.message); // Display notification
			}
		};

		return () => {
			socket.close(); // Close WebSocket connection on unmount
		};
	}, []);

	return (
		<div>
			<ToastContainer />
		</div>
	);
};

export default NotificationProvider;