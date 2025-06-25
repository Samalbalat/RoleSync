import {
	Card,
	CardHeader,
	CardBody,
	Typography,
	Rating,
} from '@material-tailwind/react';

export default function CardCampanaHorizontal() {
	return (
		<Card className='w-full max-w-[48rem] flex-row mb-4'>
			<CardHeader
				shadow={false}
				floated={false}
				className='m-0 w-2/5 shrink-0 rounded-r-none '
			>
				<img
					src='https://lasetadelgoblin.com/wp-content/uploads/2021/09/2109.01-DnD-Intro-clases-900x600.png'
					alt='card-image'
					className='h-full w-full object-cover'
				/>
			</CardHeader>
			<CardBody className='relative'>
				<div className='absolute top-4 right-4 z-10'>
					<Rating value={4} readonly />
				</div>
				<Typography variant='h6' color='gray' className='mb-4 uppercase'>
					D&D
				</Typography>
				<Typography variant='h4' color='blue-gray' className='mb-2'>
					Titulo de Campaña!!
				</Typography>
				<Typography variant='h7' color='gray' className='mb-2'>
					Fantasia Medieval
				</Typography>
				<Typography color='gray' className='mb-6 font-normal'>
					Un antiguo dragón rojo aterroriza la región, quemando aldeas y
					acumulando tesoros. Los héroes deberán unir fuerzas para encontrar su
					guarida y derrotar a la bestia antes de que destruya el reino.
				</Typography>
			</CardBody>
		</Card>
	);
}
