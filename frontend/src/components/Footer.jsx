import React from 'react';

const Footer = () => {
	return (
		<footer className='bg-gray-800 text-white p-4'>
			<div className='container mx-auto text-center'>
				<p className='text-sm'>&copy; {new Date().getFullYear()} My Application. All rights reserved.</p>
				<p className='text-xs mt-2'>Made with ❤️ by Samu & Alex</p>
			</div>
		</footer>
	);
};
export default Footer;
