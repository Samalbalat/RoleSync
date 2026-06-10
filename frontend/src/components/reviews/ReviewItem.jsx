import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Typography, Avatar, Rating } from '@material-tailwind/react';

export default function ReviewItem({ review }) {
	const { authorImage, authorName, rating, comment, createdAt } = review;

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
							src={authorImage || `https://ui-avatars.com/api/?name=${authorName}&size=256`}
							alt={authorName}
							size='sm'
							variant='circular'
						/>
						<div>
							<div className='flex items-center gap-2'>
								<Typography variant='h6' color='blue-gray' className='text-sm'>
									{authorName}
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
					{comment}
				</Typography>
			</CardBody>
		</Card>
	);
}

ReviewItem.propTypes = {
	review: PropTypes.shape({
		rating: PropTypes.number.isRequired,
		comment: PropTypes.string.isRequired,
		createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
		authorImage: PropTypes.string,
		authorName: PropTypes.string.isRequired,
		authorId: PropTypes.number.isRequired,
	}).isRequired,
};
