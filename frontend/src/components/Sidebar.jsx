import { Card, Typography } from '@material-tailwind/react';
import { navList } from '../data/menuList';

export default function Sidebar() {
	return (
		<Card className='w-full max-w-[20rem] p-6 rounded-2xl shadow-lg bg-gray-100'>
			<div className='flex flex-col items-center mb-6'>
				<Typography
					variant='h5'
					color='blue-gray'
					className='font-bold tracking-wide'
				>
					Menu
				</Typography>
				<div className='w-10 border-b-2 border-red-400 mt-2' />
			</div>
			<div className='space-y-2'>{navList}</div>
		</Card>
	);
}
