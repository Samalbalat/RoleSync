import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
} from '@material-tailwind/react';

import PropTypes from 'prop-types';

export default function CampaignCardHorizontal({ campana }) {
	const name = campana.name;
	const theme = campana.theme;
	const rpgsystem = campana.rpgsystem;
	const description = campana.description;
	const image =
		campana.image ||
		'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';

	{
		/* const navigate = useNavigate();
		onClick={() => navigate(`/campaign/${campana.id}`)} */
	}
	return (
		<Card className='w-full max-w-md flex-row mb-2 shadow-sm rounded-lg cursor-pointer'>
			<CardHeader
				shadow={false}
				floated={false}
				className='m-0 w-1/3 shrink-0 rounded-r-none p-0'
			>
				<img
					src={image}
					alt='card-image'
					className='h-full w-full object-cover rounded-l-lg'
				/>
			</CardHeader>
			<CardBody className='p-3 flex flex-col justify-between'>
				<Typography variant='h5' color='blue-gray' className='mb-1 truncate'>
					{name}
				</Typography>
				<Typography
					variant='small'
					color='gray'
					className='mb-1 uppercase font-bold'
				>
					{rpgsystem}
				</Typography>
				<Typography variant='h6' color='gray' className='mb-1'>
					{theme}
				</Typography>
				<p className='mb-6 font-normal line-clamp-4 text-gray-700 text-sm'>
					{description}
				</p>
				<div className='absolute bottom-2 right-2 z-10'>
					<Rating value={4} readonly size='sm' />
				</div>
			</CardBody>
		</Card>
	);
}
CampaignCardHorizontal.propTypes = {
	campana: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		theme: PropTypes.string.isRequired,
		rpgsystem: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		rate: PropTypes.number.isRequired,
		image: PropTypes.string,
	}).isRequired,
};
