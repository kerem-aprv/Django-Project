import React from 'react';
import Navbar from '../utils/Navbar';
import foggyBlueForest from '../static/foggy_blue_forest.jpg';
import peace from '../static/peace.png';

const Dashboard = () => {
	return (
		<div className="container">
			<Navbar />
			<div className="row">
				<div className="col-md-12">
					<h1 className="text-center welcome-message">About Chatnivo</h1>
					<p className="text-center shadows"> Where the people reach getting  darkness to brightness place with peace...</p>
					<img src={foggyBlueForest} alt="Mysterious Background" className="img-fluid" />
					<div className="join-us-container">
						<p className="text-center join-us">Enjoy The Time, where you can understand, how delightful place.</p>
						<img src={peace} alt="Peace" className="img-fluid" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
