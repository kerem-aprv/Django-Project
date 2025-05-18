import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../utils/Navbar';

const Profile = () => {
	const [userProfile, setUserProfile] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [newUsername, setNewUsername] = useState('');
	const [newEmail, setNewEmail] = useState('');
	const [newBio, setNewBio] = useState('');
	const [newProfilePicture, setNewProfilePicture] = useState(null);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [showPasswordChange, setShowPasswordChange] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
	const [passwordChangeError, setPasswordChangeError] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const response = await fetch('http://localhost:8000/user-profile/', { credentials: 'include' });
				const data = await response.json();
				console.log('Profile Picture URL:', data.profile_picture);
				setUserProfile(data);
				setNewUsername(data.username);
				setNewEmail(data.email);
				setNewBio(data.bio);
				if (data.profile_picture) {
					const profilePictureResponse = await fetch(`http://localhost:8000${data.profile_picture}`, { credentials: 'include' });
					const profilePictureBlob = await profilePictureResponse.blob();
					const profilePictureURL = URL.createObjectURL(profilePictureBlob);
					setUserProfile((prevProfile) => ({
						...prevProfile,
						profile_picture: profilePictureURL,
					}));
				} else {
					setUserProfile((prevProfile) => ({
						...prevProfile,
						profile_picture: 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png',
					}));
				}
				setFirstName(data.first_name);
				setLastName(data.last_name);
			} catch (error) {
				console.error('Error fetching user profile:', error);
			}
		};

		fetchUserProfile();
	}, []);

	const getCsrfToken = async () => {
		const response = await fetch('http://localhost:8000/get-csrf-token/', { credentials: 'include' });
		const { csrfToken } = await response.json();
		return csrfToken;
	};

	const updateProfile = async (e) => {
		e.preventDefault();
		try {
			const csrfToken = await getCsrfToken();
			const formData = new FormData();
			formData.append('username', newUsername);
			formData.append('email', newEmail);
			formData.append('bio', newBio);
			if (newProfilePicture instanceof File) {
				formData.append('profile_picture', newProfilePicture);
			}
			const response = await fetch('http://localhost:8000/user-profile/', {
				method: 'PUT',
				headers: { 'X-CSRFToken': csrfToken },
				body: formData,
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setUserProfile(data);
				setNewUsername(data.username);
				setNewEmail(data.email);
				setNewBio(data.bio);
				if (data.profile_picture) {
					const profilePictureResponse = await fetch(`http://localhost:8000${data.profile_picture}`, { credentials: 'include' });
					const profilePictureBlob = await profilePictureResponse.blob();
					const profilePictureURL = URL.createObjectURL(profilePictureBlob);
					setUserProfile((prevProfile) => ({
						...prevProfile,
						profile_picture: profilePictureURL,
					}));
				} else {
					setNewProfilePicture(null);
				}
				setEditMode(false);
			} else {
				console.error('Error updating profile:', response.status);
			}
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

	const deleteAccount = async () => {
		try {
			const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
			if (confirmed) {
				const csrfToken = await getCsrfToken();
				const response = await fetch('http://localhost:8000/delete-account/', {
					method: 'DELETE',
					headers: { 'X-CSRFToken': csrfToken },
					credentials: 'include',
				});
				if (response.ok) {
					document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
					window.location.href = '/';
				} else {
					console.error('Error deleting account:', response.status);
				}
			}
		} catch (error) {
			console.error('Error deleting account:', error);
		}
	};

	const changePassword = async (e) => {
		e.preventDefault();
		try {
			if (newPassword !== newPasswordConfirm) {
				setPasswordChangeError('Passwords do not match.');
				return;
			}
			const csrfToken = await getCsrfToken();
			const formData = new FormData();
			formData.append('old_password', currentPassword);
			formData.append('new_password1', newPassword);
			formData.append('new_password2', newPasswordConfirm);
			const response = await fetch('http://localhost:8000/change-password/', {
				method: 'POST',
				headers: { 'X-CSRFToken': csrfToken },
				body: formData,
				credentials: 'include',
			});
			if (response.ok) {
				document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				navigate('/login');
			} else {
				const data = await response.json();
				setPasswordChangeError(data.detail || 'Error changing password. Please try again.');
			}
		} catch (error) {
			setPasswordChangeError('Error changing password. Please try again.');
			console.error('Error changing password:', error);
		}
	};

	return (
		<main className="container my-5">
			<Navbar />
			<h1>User Profile</h1>
			{userProfile ? (
				editMode ? (
					<form onSubmit={updateProfile}>
						<div className="mb-3">
							<label htmlFor="username" className="form-label">Username</label>
							<input
								type="text"
								className="form-control"
								id="username"
								value={newUsername}
								onChange={(e) => setNewUsername(e.target.value)}
								required
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="email" className="form-label">Email</label>
							<input
								type="email"
								className="form-control"
								id="email"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								required
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="bio" className="form-label">Bio</label>
							<textarea
								className="form-control"
								id="bio"
								rows="3"
								value={newBio}
								onChange={(e) => setNewBio(e.target.value)}
							></textarea>
						</div>
						<div className="mb-3">
							<label htmlFor="profile-picture" className="form-label">Profile Picture</label>
							<input
								type="file"
								className="form-control"
								id="profile-picture"
								onChange={(e) => setNewProfilePicture(e.target.files[0])}
							/>
						</div>
						<button type="submit" className="btn btn-primary">Save</button>
						<button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
					</form>
				) : (
					<>
						<div className="d-flex align-items-center mb-3">
							{userProfile.profile_picture ? (
								<img
									src={userProfile.profile_picture}
									alt="Profile Picture"
									className="img-thumbnail me-3"
									width="100"
									height="100"
									style={{ marginRight: '20px', borderRadius: '50%' }}
								/>
							) : (
								<img
									src="https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png"
									alt="Default Profile"
									className="img-thumbnail me-3"
									width="100"
									height="100"
									style={{ marginRight: '20px', borderRadius: '50%' }}
								/>
							)}
							<div>
								<h2>{userProfile.username}</h2>
								<p>{userProfile.email}</p>
								<p>{userProfile.bio}</p>
							</div>
						</div>
						<button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
						<button className="btn btn-danger" onClick={() => setShowDeleteConfirmation(true)}>Delete Account</button>
						<button className="btn btn-secondary" onClick={() => setShowPasswordChange(true)}>Change Password</button>
					</>
				)
			) : (
				<p>Loading user profile...</p>
			)}
			{showDeleteConfirmation && (
				<div className="mt-3">
					<h3>Are you sure you want to delete your account?</h3>
					<button className="btn btn-danger" onClick={deleteAccount}>Confirm Delete</button>
					<button className="btn btn-secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
				</div>
			)}
			{showPasswordChange && (
				<div className="mt-3">
					<h3>Change Password</h3>
					<form onSubmit={changePassword}>
						<div className="mb-3">
							<label htmlFor="current-password" className="form-label">Current Password</label>
							<input
								type="password"
								className="form-control"
								id="current-password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								required
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="new-password" className="form-label">New Password</label>
							<input
								type="password"
								className="form-control"
								id="new-password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="new-password-confirm" className="form-label">Confirm New Password</label>
							<input
								type="password"
								className="form-control"
								id="new-password-confirm"
								value={newPasswordConfirm}
								onChange={(e) => setNewPasswordConfirm(e.target.value)}
								required
							/>
						</div>
						{passwordChangeError && <div className="alert alert-danger">{passwordChangeError}</div>}
						<button type="submit" className="btn btn-primary">Change Password</button>
						<button type="button" className="btn btn-secondary" onClick={() => setShowPasswordChange(false)}>Cancel</button>
					</form>
				</div>
			)}
		</main>
	);
};

export default Profile;
