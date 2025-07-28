import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
	CardFooter,
} from '@material-tailwind/react';
import PropTypes from 'prop-types';

export default function CampaignCardVertical({ campana }) {
	const title = campana.title;
	const theme = campana.tematica;
	const sistem = campana.sistema;
	const description = campana.descripcion;
	const ratingValue = Math.round(campana.rate);
	return (
		<Card className='mt-10'>
			<CardHeader color='blue-gray' className='relative h-36'>
				<img
					src='https://lasetadelgoblin.com/wp-content/uploads/2021/09/2109.01-DnD-Intro-clases-900x600.png'
					alt='card-image'
					className='w-full h-full object-cover'
				/>
			</CardHeader>
			<CardBody className='pb-0'>
				<Typography variant='h5' color='blue-gray' className='mb-2'>
					{title}
				</Typography>
				<Typography variant='h6' color='blue-gray'>
					{sistem}
				</Typography>
				<Typography
					variant='small'
					color='gray'
					className='mb-1 uppercase font-bold'
				>
					{theme}
				</Typography>
				<p className='mb-6 font-normal line-clamp-4 text-gray-700 text-sm'>
					{description}
				</p>
			</CardBody>
			<CardFooter className='pt-0'>
				<Rating value={ratingValue} readonly size='sm' />
			</CardFooter>
		</Card>
	);
}

CampaignCardVertical.propTypes = {
	campana: PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		tematica: PropTypes.string.isRequired,
		sistema: PropTypes.string.isRequired,
		descripcion: PropTypes.string.isRequired,
		rate: PropTypes.number.isRequired,
	}).isRequired,
};
