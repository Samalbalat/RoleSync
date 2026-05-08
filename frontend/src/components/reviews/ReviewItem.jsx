import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Avatar, Rating } from '@material-tailwind/react';

export default function ReviewItem({ review }) {
	const { rating, content, createdAt, author } = review;

	// Formateamos la fecha para que quede bonita (ej: "26 abr 2026")
	const formattedDate = new Date(createdAt).toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	return (
		<Card className='w-full shadow-sm border border-blue-gray-50'>
			<CardBody className='p-4'>
				{/* Cabecera del comentario: Avatar + Info */}
				<div className='flex items-center justify-between mb-3'>
					<div className='flex items-center gap-3'>
						<Avatar
							src={author.avatarUrl || 'https://docs.material-tailwind.com/img/face-2.jpg'}
							alt={author.profileName}
							size='sm'
							variant='circular'
						/>
						<div>
							<div className='flex items-center gap-2'>
								<Typography variant='h6' color='blue-gray' className='text-sm'>
									{author.profileName}
								</Typography>
							</div>
							<Typography variant='small' color='gray' className='text-xs font-normal'>
								{formattedDate}
							</Typography>
						</div>
					</div>
					{/* Estrellitas en modo lectura */}
					<Rating value={rating} readonly className='text-amber-500' />
				</div>

				{/* Contenido del comentario */}
				<Typography color='blue-gray' className='font-normal text-sm'>
					{content}
				</Typography>
			</CardBody>
		</Card>
	);
}

ReviewItem.propTypes = {
	review: PropTypes.shape({
		rating: PropTypes.number.isRequired,
		content: PropTypes.string.isRequired,
		createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
		author: PropTypes.shape({
			avatarUrl: PropTypes.string,
			profileName: PropTypes.string.isRequired,
			roleType: PropTypes.oneOf(['TABLETOP', 'WRITTEN']).isRequired,
		}).isRequired,
	}).isRequired,
};
