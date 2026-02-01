import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import AccountSettings from './pages/account/AccountSettings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { AuthProvider } from './utils/AuthContext';
import ProfileSelectionPage from './pages/auth/ProfileSelectionPage';

function App() {
	return (
		<AuthProvider>
			<Toaster position='top-center' reverseOrder={false} />
			<BrowserRouter>
				<Routes>
					{/* Rutas Públicas */}
					<Route element={<PublicRoute />}>
						<Route path='/login' element={<LoginPage />} />
						<Route path='/register' element={<RegisterPage />} />
					</Route>

					{/* Punto intermedio */}
					<Route element={<ProtectedRoute />}>
						<Route path='/profile-selection' element={<ProfileSelectionPage />} />
					</Route>

					{/* Rutas Privadas */}
					<Route element={<ProtectedRoute />}>
						<Route path='/' element={<MainLayout />}>
							<Route index element={<HomePage />} />

							{/* ACCOUNT */}
							<Route path='account/settings' element={<AccountSettings />} />
						</Route>
					</Route>
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
