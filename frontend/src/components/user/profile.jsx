import { Accordion, AccordionBody, AccordionHeader, Avatar, Button, Card, CardBody, CardHeader, Rating, Typography } from '@material-tailwind/react';
import React from 'react';
import PropTypes from 'prop-types';

export default function Profile({ profile, isMobileSize }) {
	Profile.propTypes = {
		profile: PropTypes.shape({
			type: PropTypes.oneOf(['table', 'narrative']).isRequired,
			photo: PropTypes.string.isRequired,
			rating: PropTypes.number.isRequired,
			charactersCount: PropTypes.number.isRequired,
			campaignsCount: PropTypes.number.isRequired,
		}).isRequired,
		isMobileSize: PropTypes.bool.isRequired,
	};

	const color = profile.type === 'table' ? 'red-900' : 'purple-900';
	const [open, setOpen] = React.useState(0);
	const handleOpen = value => setOpen(open === value ? 0 : value);

	// Ejemplo de reviews
	const reviews = [
		{
			user: 'Tania Andrew',
			photo:
				'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
			text: 'Excelente jugador, muy creativo y colaborativo en las partidas.',
			rating: 5,
		},
		{
			user: 'Carlos Pérez',
			photo: 'https://randomuser.me/api/portraits/men/32.jpg',
			text: 'Siempre aporta ideas interesantes y respeta a los demás.',
			rating: 4,
		},
		{
			user: 'Lucía Gómez',
			photo: 'https://randomuser.me/api/portraits/women/44.jpg',
			text: 'Gran narrador, sabe mantener el ritmo y la diversión.',
			rating: 5,
		},
	];

	return (
		<div className='flex 2xl:flex-row flex-col gap-8 items-center w-full'>
			<div className='flex flex-col items-center'>
				<Card className='p-2 w-full max-w-md'>
					<CardHeader floated={false} className='h-32'>
						<img
							src={profile.type === 'table' ? '/table-header.jpg' : '/narrative-header.jpg'}
							alt={profile.type === 'table' ? 'Perfil de Mesa' : 'Perfil Narrativo'}
							className='object-cover w-full h-full'
						/>
					</CardHeader>
					<CardBody className='flex flex-col items-center -mt-16'>
						<Avatar src={profile.photo} alt={profile.type === 'table' ? 'Perfil de Mesa' : 'Perfil Narrativo'} size='xxl' className='border-4 border-white' />
						<Typography variant='h5' className='mt-2 font-semibold'>
							{profile.type === 'table' ? 'Perfil de Mesa' : 'Perfil Narrativo'}
						</Typography>
						<div className={`w-14 border-b-2 border-${color} mt-2`} />
						<div className='flex justify-around w-full mt-6'>
							<div className='flex flex-col items-center'>
								<svg className={`w-5 h-5 text-${color}`} fill='currentColor' viewBox='0 0 20 20'>
									<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
								</svg>
								<Typography className='text-xs'>{profile.rating}</Typography>
							</div>
							<div className='flex flex-col items-center'>
								<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className={`w-5 h-5 text-${color}`}>
									<path
										fillRule='evenodd'
										d='M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z'
										clipRule='evenodd'
									/>
								</svg>

								<Typography className='text-xs'>{profile.charactersCount}</Typography>
							</div>
							<div className='flex flex-col items-center' data-tooltip-target='campaign'>
								<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className={`w-5 h-5 text-${color}`}>
									<path
										fillRule='evenodd'
										d='M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.379a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15ZM9 12.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z'
										clipRule='evenodd'
									/>
								</svg>
								<Typography className='text-xs'>{profile.campaignsCount}</Typography>
							</div>
							<div
								data-tooltip='campaign'
								data-tooltip-placement='bottom'
								className='absolute z-50 whitespace-normal break-words rounded-lg bg-black py-1.5 px-3 font-sans text-sm font-normal text-white focus:outline-none'
							>
								Nº de campañas
							</div>
						</div>
						<Button color={profile.type === 'table' ? 'red' : 'purple'} variant='gradient' size='md' className='mt-6'>
							Editar Perfil
						</Button>
					</CardBody>
				</Card>
			</div>

			{!isMobileSize ? (
				<div className='flex-1 flex flex-col gap-6'>
					<Typography variant='h4' color='blue-gray' className='mt-6'>
						Comentarios
					</Typography>
					{reviews.map((review, idx) => (
						<Card key={idx} shadow={false} className='w-full max-w-md'>
							<CardHeader floated={false} shadow={false} className='mx-0 flex items-center gap-4 pt-0 pb-4'>
								<Avatar size='sm' variant='circular' src={review.photo} alt={review.user} />
								<div className='flex w-full flex-col gap-0.5'>
									<div className='flex items-center justify-between'>
										<Typography variant='h6' color='blue-gray'>
											{review.user}
										</Typography>
										<Rating value={5} readonly />
									</div>
								</div>
							</CardHeader>
							<CardBody className='mb-2 p-0'>
								<Typography variant='small'>{review.text}</Typography>
							</CardBody>
						</Card>
					))}
				</div>
			) : (
				<div className='flex-1 flex flex-col gap-6'>
					<Accordion open={open === 1}>
						<AccordionHeader onClick={() => handleOpen(1)}>Comentarios</AccordionHeader>
						<AccordionBody>
							{reviews.map((review, idx) => (
								<Card key={idx} shadow={false} className='w-full max-w-md'>
									<CardHeader floated={false} shadow={false} className='mx-0 flex items-center gap-4 pt-0 pb-4'>
										<Avatar size='sm' variant='circular' src={review.photo} alt={review.user} />
										<div className='flex w-full flex-col gap-0.5'>
											<div className='flex items-center justify-between'>
												<Typography variant='h6' color='blue-gray'>
													{review.user}
												</Typography>
												<Rating value={5} readonly />
											</div>
										</div>
									</CardHeader>
									<CardBody className='mb-2 p-0'>
										<Typography variant='small'>{review.text}</Typography>
									</CardBody>
								</Card>
							))}
						</AccordionBody>
					</Accordion>
				</div>
			)}
		</div>
	);
}
