import React from 'react';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ListarCampanas from './components/campanas/ListarCampanas.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';

function App() {
	const [isMobileSize, setisMobileSize] = React.useState(false);
	const [filterCollapsed, setFilterCollapsed] = React.useState(false);

	React.useEffect(() => {
		const handleResize = () => {
			setisMobileSize(window.innerWidth <= 720);
			setFilterCollapsed(window.innerWidth <= 1150);
		};
		handleResize(); // Para establecer el estado inicial correctamente
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='min-h-screen flex flex-col'>
			<BrowserRouter>
				<Navbar />

				<div className='flex flex-1 mt-20 mx-auto'>
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
									<ListarCampanas
										isMobileSize={isMobileSize}
										filterCollapsed={filterCollapsed}
									/>
								}
							/>
							<Route
								path='/listarcampanas'
								element={
									<ListarCampanas
										isMobileSize={isMobileSize}
										filterCollapsed={filterCollapsed}
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
