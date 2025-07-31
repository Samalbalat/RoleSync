import React from 'react';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ListCampaigns from './components/campaign/ListCampaign.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import CampaignDetail from './components/campaign/CampaignDetail.jsx';

function App() {
	const [isMobileSize, setisMobileSize] = React.useState(false);
	const [midSize, setMidSize] = React.useState(false);
	const user_email = 'gm@example.com'; // Simulación de email de usuario
	React.useEffect(() => {
		const handleResize = () => {
			setisMobileSize(window.innerWidth <= 720);
			setMidSize(window.innerWidth <= 1150);
		};
		handleResize(); // Para establecer el estado inicial correctamente
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='min-h-screen flex flex-col'>
			<BrowserRouter>
				<Navbar />

				<div
					className={`flex flex-1 mx-auto ${!isMobileSize ? 'mt-28' : 'mt-20'}`}
				>
					{!isMobileSize && (
						<div className='fixed ml-6'>
							<Sidebar />
						</div>
					)}
					<main
						className={`flex-grow p-6 pt-0 ${!isMobileSize ? 'ml-80' : ''}`}
					>
						<Routes>
							<Route
								exact
								path='/'
								element={
									<ListCampaigns
										isMobileSize={isMobileSize}
										midSize={midSize}
									/>
								}
							/>
							<Route
								path='/list_campaigns'
								element={
									<ListCampaigns
										isMobileSize={isMobileSize}
										midSize={midSize}
									/>
								}
							/>
							<Route
								path='/campaign/:id'
								element={
									<CampaignDetail
										isMobileSize={isMobileSize}
										midSize={midSize}
										user_email={user_email}
									/>
								}
							/>
						</Routes>
					</main>
				</div>
				<Footer />
			</BrowserRouter>
		</div>
	);
}

export default App;
