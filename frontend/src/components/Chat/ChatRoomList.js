import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../utils/Navbar';

const ChatroomList = () => {
	const [chatrooms, setChatrooms] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchChatrooms = async () => {
			try {
				const response = await fetch('http://localhost:8000/chatroom_list/', {
					credentials: 'include',
				});
				const data = await response.json();
				setChatrooms(data.chatroom);
			} catch (error) {
				console.error('Error fetching chatrooms:', error);
			}
		};

		fetchChatrooms();
	}, []);

	const navigateToChatroom = (chatroom) => {
		navigate(`/chat/${chatroom.id}`, { state: { chatroom } });
	};

	return (
		<div>
			<Navbar />
			<div className="container">
				<h2>Chatrooms</h2>
				<div className="chatroom-boxes">
					{chatrooms.map((chatroom) => (
						<div
							key={chatroom.id}
							className={`chatroom-box ${chatroom.type}`}
							onClick={() => navigateToChatroom(chatroom)}
						>
							<h3>{chatroom.name}</h3>
							<p>Type: {chatroom.type}</p>
							<button onClick={() => navigateToChatroom(chatroom)}>Enter Chatroom</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ChatroomList;
