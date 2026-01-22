import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = () => {
	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			<Navbar />

			<div className='flex flex-1 pt-[72px]'>
				{' '}
				<aside className='hidden lg:block w-64 fixed h-[calc(100vh-72px)] overflow-y-auto border-r border-gray-200 bg-white'>
					<Sidebar />
				</aside>
				<main className='w-full lg:ml-64 p-4 md:p-8'>
					<Outlet />
				</main>
			</div>

			<div className='lg:ml-64'>
				<Footer />
			</div>
		</div>
	);
};

export default MainLayout;
