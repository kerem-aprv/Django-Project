// CreateChatroom.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../utils/Navbar';

const CreateChatroom = () => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [type, setType] = useState('global');
	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		const response = await fetch('http://localhost:8000/get-available-users/');
		const data = await response.json();
		setUsers(data.users);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const csrfToken = await getCsrfToken();
		const chatroomData = {
			name,
			description,
			type,
			users: selectedUsers,
		};

		const response = await fetch('http://localhost:8000/create_chatroom/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify(chatroomData),
			credentials: 'include',
		});

		if (response.ok) {
			navigate('/dashboard');
		} else {
			console.error('Error creating chatroom:', response.status);
		}
	};

	const handleUserSelect = (e) => {
		const selected = [...selectedUsers];
		const userId = parseInt(e.target.value, 10);

		if (e.target.checked) {
			selected.push(userId);
		} else {
			const index = selected.indexOf(userId);
			if (index > -1) {
				selected.splice(index, 1);
			}
		}

		setSelectedUsers(selected);
	};

	const getCsrfToken = async () => {
		const response = await fetch('http://localhost:8000/get-csrf-token/', {
			credentials: 'include',
		});
		const { csrfToken } = await response.json();
		return csrfToken;
	};

	return (
		<div className="container">
			<Navbar />
			<h1 className="text-center">Create Chatroom</h1>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="name">Chatroom Name</label>
					<input
						type="text"
						className="form-control"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="description">Description</label>
					<input
						type="text"
						className="form-control"
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="type">Type</label>
					<select
						className="form-control"
						id="type"
						value={type}
						onChange={(e) => setType(e.target.value)}
						required
					>
						<option value="global">Global</option>
						<option value="private">Private</option>
					</select>
				</div>
				{type === 'private' && (
					<div className="form-group">
						<label htmlFor="users">Select Users</label>
						<div>
							{users.map((user) => (
								<div key={user.id}>
									<input
										type="checkbox"
										id={`user-${user.id}`}
										value={user.id}
										onChange={handleUserSelect}
									/>
									<label htmlFor={`user-${user.id}`}>{user.username}</label>
								</div>
							))}
						</div>
					</div>
				)}
				<button type="submit" className="btn btn-primary">Create</button>
			</form>
		</div>
	);
};

export default CreateChatroom;