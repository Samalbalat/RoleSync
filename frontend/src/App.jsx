import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import AccountSettings from './pages/account/AccountSettings';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Rutas Públicas */}
				<Route path='/login' element={<LoginPage />} />
				<Route path='/register' element={<RegisterPage />} />

				{/* Rutas Privadas */}
				<Route path='/' element={<MainLayout />}>
					<Route index element={<HomePage />} />

					{/* ACCOUNT */}
					<Route path='account/settings' element={<AccountSettings />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
