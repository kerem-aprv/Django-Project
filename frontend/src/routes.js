import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import ChatRoomList from './components/Chat/ChatRoomList';
import ChatRoom from './components/Chat/ChatRoom';

const routes = [
	{ path: '/login', component: Login },
	{ path: '/register', component: Register },
	{ path: '/profile', component: Profile },
	{ path: '/chatrooms', component: ChatRoomList },
	{ path: '/chatroom/:id', component: ChatRoom },
];

export default routes;
