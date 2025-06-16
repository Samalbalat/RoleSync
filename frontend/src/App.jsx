import React from 'react';

import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ListarCampanas from './components/campanas/ListarCampanas.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';

function App() {
	return (
		<div className='min-h-screen flex flex-col'>
			<BrowserRouter>
				<Navbar />
				<Sidebar />
				<main className='flex-grow container pt-20'>
					<Routes>
						<Route exact path='/' element={<ListarCampanas />} />
						<Route path='/listarcampanas' element={<ListarCampanas />} />
					</Routes>
				</main>
				<Footer />
			</BrowserRouter>
		</div>
	);
}

export default App;
