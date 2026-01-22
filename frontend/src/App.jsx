import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';

function App() {
	// const user_email = 'gm@example.com';

	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<MainLayout />}>
					<Route index element={<HomePage />} />

					{/* Redirección: si entran a /list_campaigns, los mandamos al home */}
					<Route path='home_page' element={<Navigate to='/' replace />} />

					{/* <Route path='list_campaigns' element={<Navigate to='/' replace />} />
					<Route path='campaign/:id' element={<CampaignDetail user_email={user_email} />} />*/}
				</Route>

				{/* Aquí podrías poner rutas SIN layout (ej. Login)
                    <Route path="/login" element={<Login />} /> 
                */}
			</Routes>
		</BrowserRouter>
	);
}

export default App;
