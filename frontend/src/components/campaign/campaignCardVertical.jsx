import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
	CardFooter,
} from '@material-tailwind/react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import parseRpgSystem from '../../data/RPGSystem';

export default function CampaignCardVertical({ campana }) {
	const id = campana.id;
	const name = campana.name;
	const theme = campana.theme;
	const rpgsystem = parseRpgSystem(campana.rpgsystem);
	const description = campana.description;
	const image =
		campana.image ||
		'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';

	const navigate = useNavigate();

	return (
		<Card
			className='mt-10 cursor-pointer'
			onClick={() => navigate(`/campaign/${id}`)}
		>
			<CardHeader color='blue-gray' className='relative h-36'>
				<img
					src={image}
					alt='card-image'
					className='w-full h-full object-cover'
				/>
			</CardHeader>
			<CardBody className='pb-0'>
				<Typography variant='h5' color='blue-gray' className='mb-2'>
					{name}
				</Typography>
				{rpgsystem && (
					<Typography variant='h6' color='blue-gray'>
						{rpgsystem}
					</Typography>
				)}
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
				<Rating value={4} readonly size='sm' />
			</CardFooter>
		</Card>
	);
}

CampaignCardVertical.propTypes = {
	campana: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		theme: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		image: PropTypes.string,
	}).isRequired,
};
