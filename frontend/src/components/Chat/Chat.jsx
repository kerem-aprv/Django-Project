import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from '../../utils/Navbar';

const Chat = () => {
	const { chatroom_id } = useParams();
	const { state } = useLocation();
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await fetch(`http://localhost:8000/chatroom/${chatroom_id}/`, {
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					setMessages(data.messages);
				} else {
					console.error('Failed to fetch messages');
				}
			} catch (error) {
				console.error('Error fetching messages:', error);
			}
		};

		fetchMessages();
	}, [chatroom_id]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		try {
			const csrfToken = await getCsrfToken();
			const response = await fetch(`http://localhost:8000/send_message/${chatroom_id}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				credentials: 'include',
				body: JSON.stringify({ text: message }),
			});
			if (response.ok) {
				setMessage('');
				const data = await response.json();
				setMessages((prevMessages) => [...prevMessages, data.message]);
			} else {
				console.error('Failed to send message');
			}
		} catch (error) {
			console.error('Error sending message:', error);
		}
	};

	const getCsrfToken = async () => {
		const response = await fetch('http://localhost:8000/get-csrf-token/', {
			credentials: 'include',
		});
		if (response.ok) {
			const data = await response.json();
			return data.csrfToken;
		}
		throw new Error('Failed to fetch CSRF token');
	};

	return (
		<div>
			<Navbar />
			<div className="container">
				<h2>{state?.chatroom?.name || 'Chatroom'}</h2>
				<div className="messages">
					{messages.map((msg, index) => (
						<div key={index} className="message">
							<img
								src="https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"
								alt="avatar"
								className="avatar"
								width={30}
								style={{ borderRadius: '50%' }}
							/>
							<div className="message-content">
								<p style={{ color: 'red' }} className="username">{msg.user__username}</p>
								<p>{msg.text}</p>
							</div>
						</div>
					))}
				</div>
				<form onSubmit={handleSendMessage}>
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type a message..."
						required
					/>
					<button type="submit">Send</button>
				</form>
			</div>
		</div>
	);
};

export default Chat;