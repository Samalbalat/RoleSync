import { Card, Typography } from '@material-tailwind/react';

import { navList } from '../data/menuList';

export default function Sidebar() {
	return (
		<Card className='w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-gray-200'>
			<div className='mb-2 p-4'>
				<Typography variant='h5' color='blue-gray'>
					Menu
				</Typography>
			</div>
			{navList}
		</Card>
	);
}
