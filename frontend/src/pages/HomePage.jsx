import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function HomePage() {
	const location = useLocation();
	const successMessage = location.state?.message;
	const errorMessage = location.state?.errorMessage;

	useEffect(() => {
		if (successMessage) {
			toast.success(successMessage, {
				id: 'registro-exito',
				style: {
					background: '#333',
					color: '#fff',
				},
			});
			window.history.replaceState({}, document.title);
		}
	}, [successMessage, errorMessage]);

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
			<header className='bg-white shadow'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
					<h1 className='text-3xl font-bold text-gray-900'>RoleSync</h1>
					<p className='text-gray-600 mt-1'>Gestión de Roles y Sincronización</p>
				</div>
			</header>

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<div className='bg-white rounded-lg shadow-lg p-8 mb-12'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>Bienvenido a RoleSync</h2>
					<p className='text-gray-700 text-lg mb-6'>
						Administra y sincroniza los roles de tu aplicación de forma eficiente y segura.
					</p>
					<button className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200'>
						Comenzar
					</button>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					<div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200'>
						<div className='text-indigo-600 text-3xl mb-3'>🔐</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-2'>Seguridad</h3>
						<p className='text-gray-600'>Protege tus datos con nuestro sistema de roles avanzado y seguro.</p>
					</div>

					<div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200'>
						<div className='text-indigo-600 text-3xl mb-3'>⚙️</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-2'>Sincronización</h3>
						<p className='text-gray-600'>Sincroniza roles en tiempo real entre tus sistemas y aplicaciones.</p>
					</div>

					<div className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200'>
						<div className='text-indigo-600 text-3xl mb-3'>📊</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-2'>Análisis</h3>
						<p className='text-gray-600'>Visualiza y analiza los roles y permisos de tus usuarios.</p>
					</div>
				</div>
			</main>
		</div>
	);
}
