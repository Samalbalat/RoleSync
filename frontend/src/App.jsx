import React from 'react';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ListCampaigns from './components/campaign/ListCampaign.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import CampaignDetail from './components/campaign/CampaignDetail.jsx';
import CreateCampaign from './components/campaign/CreateCampaign.jsx';
import UserProfile from './components/user/userprofile.jsx';

function App() {
	const user_email = 'gm@example.com'; // Simulación de email de usuario
	const profile_type = 'table';

	const [isMobileSize, setisMobileSize] = React.useState(false);
	const [midSize, setMidSize] = React.useState(false);
	const [isDesktopSize, setIsDesktopSize] = React.useState(true);

	React.useEffect(() => {
		const handleResize = () => {
			setisMobileSize(window.innerWidth <= 720);
			setMidSize(window.innerWidth <= 1150);
			setIsDesktopSize(window.innerWidth > 720);
		};
		handleResize(); // Para establecer el estado inicial correctamente
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='min-h-screen flex flex-col'>
			<BrowserRouter>
				<Navbar />

				<div className={`flex flex-1 mx-auto ${isDesktopSize ? 'mt-28' : 'mt-20'}`}>
					{isDesktopSize && (
						<div className='fixed ml-6'>
							<Sidebar />
						</div>
					)}
					<main className={`flex-grow p-6 pt-0 ${isDesktopSize ? 'ml-80' : ''}`}>
						<Routes>
							<Route exact path='/' element={<ListCampaigns isMobileSize={isMobileSize} midSize={midSize} />} />
							<Route path='/userprofile' element={<UserProfile isMobileSize={isMobileSize} />} />
							<Route path='/list_campaigns' element={<ListCampaigns isMobileSize={isMobileSize} midSize={midSize} />} />
							<Route path='/campaign/:id' element={<CampaignDetail isMobileSize={isMobileSize} midSize={midSize} user_email={user_email} />} />
							<Route
								path='/create-campaign'
								element={<CreateCampaign isMobileSize={isMobileSize} midSize={midSize} user_email={user_email} profile_type={profile_type} />}
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
