import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { AuthProvider } from './utils/AuthContext';
import ProfileSelectionPage from './pages/auth/ProfileSelectionPage';
import FindCampaignPage from './pages/campaign/FindCampaignPage';
import CampaignDetailPage from './pages/campaign/CampaignDetailPage';
import CreateCampaignPage from './pages/campaign/CreateCampaignPage';
import EditCampaignPage from './pages/campaign/EditCampaignPage';
import TemplateBuilder from './components/character/TemplateBuilder';
import CreateCharacterPage from './pages/character/CreateCharacterPage';
import GeneralForumPage from './pages/forum/GeneralForumPage';
import ThreadDetailPage from './pages/forum/ThreadDetailPage';
import CreateGeneralPost from './components/forum/CreateGeneralPost';
import MyPostsPage from './pages/forum/MyPostsPage';
import { ProfileDetailsPage } from './pages/profile/ProfileDetailsPage';

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

							{/* Rutas de Perfil */}
							<Route path='/profile/:id' element={<ProfileDetailsPage />} />

							{/* Rutas de Campañas */}
							<Route path='find-campaign' element={<FindCampaignPage />} />
							<Route path='campaign/:id' element={<CampaignDetailPage />} />
							<Route path='campaigns/create' element={<CreateCampaignPage />} />
							<Route path='campaigns/edit/:id' element={<EditCampaignPage />} />

							{/* Rutas de Personajes */}
							<Route
								path='character/templateBuilder'
								element={
									<div className='min-h-screen bg-gray-50 py-10'>
										<TemplateBuilder />
									</div>
								}
							/>
							{/* onClick={() => navigate(`/character/templateBuilder?campaignId=${campaign.id}`)} /> */}
							<Route path='createCharacter' element={<CreateCharacterPage />} />
							{/* onClick={() => navigate(`/createCharacter?campaignId=${campaign.id}`)} */}

							{/* Rutas de Foros generales */}
							<Route path='forum' element={<GeneralForumPage />} />
							<Route path='forum/my-posts' element={<MyPostsPage />} />
							<Route path='forum/:id' element={<ThreadDetailPage />} />
							<Route path='postForum' element={<CreateGeneralPost />} />
						</Route>
					</Route>
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
