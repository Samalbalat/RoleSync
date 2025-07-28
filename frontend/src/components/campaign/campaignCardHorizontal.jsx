import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
} from '@material-tailwind/react';

import PropTypes from 'prop-types';

export default function CampaignCardHorizontal({ campana }) {
	const title = campana.title;
	const theme = campana.tematica;
	const sistem = campana.sistema;
	const description = campana.descripcion;
	const ratingValue = Math.round(campana.rate);
	return (
		<Card className='w-full max-w-md flex-row mb-2 shadow-sm rounded-lg'>
			<CardHeader
				shadow={false}
				floated={false}
				className='m-0 w-1/3 shrink-0 rounded-r-none p-0'
			>
				<img
					src='https://lasetadelgoblin.com/wp-content/uploads/2021/09/2109.01-DnD-Intro-clases-900x600.png'
					alt='card-image'
					className='h-full w-full object-cover rounded-l-lg'
				/>
			</CardHeader>
			<CardBody className='p-3 flex flex-col justify-between'>
				<Typography variant='h5' color='blue-gray' className='mb-1 truncate'>
					{title}
				</Typography>
				<Typography
					variant='small'
					color='gray'
					className='mb-1 uppercase font-bold'
				>
					{sistem}
				</Typography>
				<Typography variant='h6' color='gray' className='mb-1'>
					{theme}
				</Typography>
				<p className='mb-6 font-normal line-clamp-4 text-gray-700 text-sm'>
					{description}
				</p>
				<div className='absolute bottom-2 right-2 z-10'>
					<Rating value={ratingValue} readonly size='sm' />
				</div>
			</CardBody>
		</Card>
	);
}
CampaignCardHorizontal.propTypes = {
	campana: PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		tematica: PropTypes.string.isRequired,
		sistema: PropTypes.string.isRequired,
		descripcion: PropTypes.string.isRequired,
		rate: PropTypes.number.isRequired,
	}).isRequired,
};
