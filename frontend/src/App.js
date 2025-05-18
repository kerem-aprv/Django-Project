// src/App.js

import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile/Profile';
import CreateChatroom from './components/Chat/CreateChatroom';
import ChatroomList from './components/Chat/ChatRoomList';
import Chatroom from './components/Chat/Chatroom';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-chatroom" element={<CreateChatroom />} />
        <Route path="/chatroom/:id" element={<Chatroom />} />
        <Route path="/chatrooms" element={<ChatroomList />} />
        <Route path="/" element={<Navigate to="/dashboard"/>} />
        <Route path="/chatroom-list" element={<ChatroomList />} />
        <Route path="/chat/:chatroom_id" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
