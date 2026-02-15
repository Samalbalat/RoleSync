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
import FindCampaignPage from './pages/campaign/FindCampaignPage';
import CampaignDetailPage from './pages/campaign/CampaignDetailPage';

function App() {
	return (
		<AuthProvider>
			<Toaster position='top-center' reverseOrder={false} />
			<BrowserRouter>
				<Routes>
					{/* =========================================
            				RUTAS PÚBLICAS (Sin Login)
           			========================================= */}
					<Route element={<PublicRoute />}>
						<Route path='/login' element={<LoginPage />} />
						<Route path='/register' element={<RegisterPage />} />
					</Route>

					{/* =========================================
            				RUTAS PRIVADAS: NIVEL CUENTA
            			(Logueado, pero eligiendo perfil)
           			========================================= */}
					<Route element={<ProtectedRoute />}>
						<Route path='/profile-selection' element={<ProfileSelectionPage />} />
					</Route>

					{/* =========================================
            				RUTAS PRIVADAS: NIVEL APP
            		(Logueado + Perfil Seleccionado + Navbar + Sidebar)
           			========================================= */}
					<Route element={<ProtectedRoute />}>
						<Route path='/' element={<MainLayout />}>
							<Route index element={<HomePage />} />

							{/* Rutas de Cuenta */}
							<Route path='account/settings' element={<AccountSettings />} />

							{/* Rutas de Campañas */}
							<Route path='find-campaign' element={<FindCampaignPage />} />
							<Route path='/campaign/:id' element={<CampaignDetailPage />} />
						</Route>
					</Route>
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
