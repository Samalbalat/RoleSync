import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CardCampanaHorizontal from './cardCampanaHorizontal';
import {
	Button,
	Card,
	Checkbox,
	Input,
	Typography,
	Select,
	Option,
} from '@material-tailwind/react';
import CardCampanaVertical from './cardCampanaVertical';

const FiltrosCampanas = () => {
	return (
		<Card className='w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-gray-300'>
			<div className='mb-2'>
				<Typography variant='h5' color='blue-gray'>
					AQUI IRÁN LOS FILTROS
				</Typography>
				<br />
				<Typography variant='h5' color='red'>
					Solo ejemplo. Actualmente no funciona
				</Typography>
				<br />

				<Checkbox
					color='red'
					label={
						<Typography color='blue-gray' className='flex font-medium'>
							Ejemplo Checkbox
						</Typography>
					}
				/>
				<br />
				<br />
				<Input color='red' label='Ejemplo Input' className='w-full' />
				<br />
				<Select color='blue' label='Ejemplo Desplegable' className='w-full'>
					<Option>Opcion 1</Option>
					<Option>Opcion 2</Option>
					<Option>Opcion 3</Option>
					<Option>Opcion 4</Option>
					<Option>Opcion 5</Option>
				</Select>
				<br />
				<div className='flex justify-center'>
					<Button size='sm'>Filtrar</Button>
				</div>
			</div>
		</Card>
	);
};

const FiltrosCampanasMobile = () => {
	const [open, setOpen] = useState(false);
	return (
		<Card className='w-full p-4 shadow-xl shadow-blue-gray-900/5 bg-gray-300'>
			<button
				type='button'
				className='flex items-center justify-between cursor-pointer w-full bg-transparent border-0 p-0 focus:outline-none'
				onClick={() => setOpen(!open)}
				aria-expanded={open}
			>
				<Typography variant='h5' color='blue-gray'>
					AQUI IRÁN LOS FILTROS
				</Typography>

				<span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
						className='size-6'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z'
						/>
					</svg>
				</span>
			</button>
			{open && (
				<div className='mt-4'>
					<Typography variant='h5' color='red'>
						Solo ejemplo. Actualmente no funciona
					</Typography>
					<br />

					<Checkbox
						color='red'
						label={
							<Typography color='blue-gray' className='flex font-medium'>
								Ejemplo Checkbox
							</Typography>
						}
					/>
					<br />
					<br />
					<Input color='red' label='Ejemplo Input' className='w-full' />
					<br />
					<Select color='blue' label='Ejemplo Desplegable' className='w-full'>
						<Option>Opcion 1</Option>
						<Option>Opcion 2</Option>
						<Option>Opcion 3</Option>
						<Option>Opcion 4</Option>
						<Option>Opcion 5</Option>
					</Select>
					<br />
					<div className='flex justify-center'>
						<Button size='sm'>Filtrar</Button>
					</div>
				</div>
			)}
		</Card>
	);
};

export default function ListarCampanas({ isMobileSize }) {
	ListarCampanas.propTypes = {
		isMobileSize: PropTypes.bool.isRequired,
	};
	return (
		<>
			{!isMobileSize ? (
				<div className='flex flex-col md:flex-row gap-6'>
					<div className='w-full md:w-1/4'>
						<FiltrosCampanas />
					</div>

					<div className='w-full md:w-3/4'>
						<CardCampanaHorizontal />
						<CardCampanaHorizontal />
						<CardCampanaHorizontal />
						<CardCampanaHorizontal />
					</div>
				</div>
			) : (
				<>
					<div className='w-full mb-2'>
						<FiltrosCampanasMobile />
					</div>
					<div className='grid grid-cols-2 gap-6'>
						<CardCampanaVertical />
						<CardCampanaVertical />
					</div>
				</>
			)}
		</>
	);
}
