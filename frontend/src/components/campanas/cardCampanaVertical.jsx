import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
	CardFooter,
} from '@material-tailwind/react';

export default function CardCampanaHorizontal() {
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
					Titulo de Campaña!!
				</Typography>
				<Typography variant='h6' color='blue-gray'>
					D&D
				</Typography>
				<Typography color='gray' variant='small' className='mb-6 font-normal'>
					<p className='line-clamp-4'>
						Un antiguo dragón rojo aterroriza la región, quemando aldeas y
						acumulando tesoros. Los héroes deberán unir fuerzas para encontrar
						su guarida y derrotar a la bestia antes de que destruya el reino.
					</p>
				</Typography>
			</CardBody>
			<CardFooter className='pt-0'>
				<Rating value={4} readonly />
			</CardFooter>
		</Card>
	);
}
