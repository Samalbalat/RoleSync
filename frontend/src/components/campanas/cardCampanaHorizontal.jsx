import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
} from '@material-tailwind/react';

export default function CardCampanaHorizontal() {
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
			<CardBody className='relative p-3 flex flex-col justify-between'>
				<div className='absolute top-2 right-2 z-10'>
					<Rating value={4} readonly size='sm' />
				</div>
				<Typography
					variant='small'
					color='gray'
					className='mb-1 uppercase font-bold'
				>
					D&D
				</Typography>
				<Typography variant='h5' color='blue-gray' className='mb-1 truncate'>
					Titulo de Campaña!!
				</Typography>
				<Typography variant='h6' color='gray' className='mb-1'>
					Fantasia Medieval
				</Typography>
				<Typography color='gray' variant='small' className='mb-6 font-normal'>
					<p className='line-clamp-3'>
						Un antiguo dragón rojo aterroriza la región, quemando aldeas y
						acumulando tesoros. Los héroes deberán unir fuerzas para encontrar
						su guarida y derrotar a la bestia antes de que destruya el reino.
					</p>
				</Typography>
			</CardBody>
		</Card>
	);
}
