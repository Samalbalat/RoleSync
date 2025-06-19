import React from 'react';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ListarCampanas from './components/campanas/ListarCampanas.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';

function App() {
	const [isMobileSize, setisMobileSize] = React.useState(false);

	React.useEffect(() => {
		const handleResize = () => {
			setisMobileSize(window.innerWidth <= 960);
		};
		handleResize(); // Para establecer el estado inicial correctamente
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='min-h-screen flex flex-col'>
			<BrowserRouter>
				<Navbar />
				<div className='flex flex-1 pt-4'>
					{!isMobileSize && (
						<div className='fixed left-4'>
							<Sidebar />
						</div>
					)}
					<main className={`flex-grow p-6 ${!isMobileSize ? 'ml-80' : ''}`}>
						<Routes>
							<Route exact path='/' element={<ListarCampanas />} />
							<Route path='/listarcampanas' element={<ListarCampanas />} />
						</Routes>
					</main>
				</div>
				<Footer />
			</BrowserRouter>
		</div>
	);
}

export default App;
