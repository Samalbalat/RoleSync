import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Typography,
	Rating,
} from '@material-tailwind/react';

export default function CardCampanaVertical() {
	return (
		<Card className='mt-10'>
			<CardHeader color='blue-gray' className='relative h-36'>
				<img
					src='https://lasetadelgoblin.com/wp-content/uploads/2021/09/2109.01-DnD-Intro-clases-900x600.png'
					alt='card-image'
					className='w-full h-full object-cover'
				/>
			</CardHeader>
			<CardBody>
				<Typography variant='h6' color='blue-gray' className='mb-2'>
					Titulo de Campaña!!
				</Typography>
				<Typography variant='h7' color='blue-gray'>
					D&D
				</Typography>
			</CardBody>
			<CardFooter className='pt-0'>
				<Rating value={4} readonly />
			</CardFooter>
		</Card>
	);
}
