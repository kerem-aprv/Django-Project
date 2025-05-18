import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Chatroom = () => {
	const { id } = useParams();
	const [chatroom, setChatroom] = useState(null);

	useEffect(() => {
		const fetchChatroom = async () => {
			const response = await fetch(`http://localhost:8000/chatrooms/${id}/`);
			const data = await response.json();
			setChatroom(data);
		};

		fetchChatroom();
	}, [id]);

	if (!chatroom) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container">
			<h1 className="text-center">{chatroom.name}</h1>
			<p>{chatroom.description}</p>
			<p>Type: {chatroom.type}</p>
			<h3>Users</h3>
			<ul>
				{chatroom.users.map(user => (
					<li key={user.id}>{user.username}</li>
				))}
			</ul>
			<Link to="/dashboard" className="btn btn-secondary">Home</Link>
		</div>
	);
};

export default Chatroom;