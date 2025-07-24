import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CardCampanaHorizontal from './cardCampanaHorizontal';
import CardCampanaVertical from './cardCampanaVertical';
import {
	Button,
	Checkbox,
	Input,
	Typography,
	Select,
	Option,
} from '@material-tailwind/react';
import lista_campanas from '../../data/ejemplo_campañas';

const FiltrosCampanas = () => {
	return (
		<div className='w-full max-w-[20rem] px-2 py-4 flex flex-col items-center'>
			<Typography
				variant='h5'
				color='blue-gray'
				className='font-bold tracking-wide mb-1'
			>
				Aquí irán los filtros
			</Typography>
			<div className='w-12 border-b-2 border-red-400 mb-4' />
			<Typography
				variant='small'
				color='red'
				className='text-center font-semibold mb-6'
			>
				Solo ejemplo. Actualmente no funciona
			</Typography>
			<div className='w-full flex flex-col gap-5'>
				<Checkbox
					color='red'
					label={
						<Typography color='blue-gray' className='flex font-medium'>
							Ejemplo Checkbox
						</Typography>
					}
				/>
				<Input color='red' label='Ejemplo Input' className='w-full' />
				<Select color='blue' label='Ejemplo Desplegable' className='w-full'>
					<Option>Opcion 1</Option>
					<Option>Opcion 2</Option>
					<Option>Opcion 3</Option>
					<Option>Opcion 4</Option>
					<Option>Opcion 5</Option>
				</Select>
				<div className='flex justify-center pt-2'>
					<Button
						size='sm'
						color='red'
						className='shadow-md hover:scale-105 transition-transform font-bold px-6 py-2'
					>
						Filtrar
					</Button>
				</div>
			</div>
		</div>
	);
};

const FiltrosCampanasMobile = () => {
	const [open, setOpen] = useState(false);
	return (
		<div className='w-full px-2'>
			<button
				type='button'
				className='flex items-center justify-between w-full py-2'
				onClick={() => setOpen(!open)}
				aria-expanded={open}
			>
				<Typography variant='h6' color='blue-gray' className='font-bold'>
					Filtros
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
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</span>
			</button>
			{open && (
				<div className='mt-2 flex flex-col items-center'>
					<Typography
						variant='small'
						color='red'
						className='text-center font-semibold mb-4'
					>
						Solo ejemplo. Actualmente no funciona
					</Typography>
					<div className='w-full flex flex-col gap-4'>
						<Checkbox
							color='red'
							label={
								<Typography color='blue-gray' className='flex font-medium'>
									Ejemplo Checkbox
								</Typography>
							}
						/>
						<Input color='red' label='Ejemplo Input' className='w-full' />
						<Select color='blue' label='Ejemplo Desplegable' className='w-full'>
							<Option>Opcion 1</Option>
							<Option>Opcion 2</Option>
							<Option>Opcion 3</Option>
							<Option>Opcion 4</Option>
							<Option>Opcion 5</Option>
						</Select>
						<div className='flex justify-center pt-2'>
							<Button
								size='md'
								color='red'
								className='shadow-md hover:scale-105 transition-transform font-bold px-8 py-3'
							>
								Filtrar
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default function ListarCampanas({ isMobileSize, filterCollapsed }) {
	ListarCampanas.propTypes = {
		isMobileSize: PropTypes.bool.isRequired,
		filterCollapsed: PropTypes.bool.isRequired,
	};
	return (
		<>
			{!isMobileSize ? (
				<div className='flex flex-col md:flex-row gap-6'>
					{!filterCollapsed ? (
						<>
							<div className='w-full md:w-1/4'>
								<FiltrosCampanas />
							</div>

							<div className='w-full md:w-3/4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
								{lista_campanas.map(campana => (
									<CardCampanaVertical key={campana.id} campana={campana} />
								))}
							</div>
						</>
					) : (
						<div className='w-full flex flex-col gap-3'>
							<div className='mt-3'>
								<FiltrosCampanasMobile />
							</div>

							<div
								className='w-full h-[2px] my-1'
								style={{
									background:
										'linear-gradient(90deg, #f43f5e 0%, #3b82f6 100%)',
								}}
							/>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
								{lista_campanas.map(campana => (
									<CardCampanaVertical key={campana.id} campana={campana} />
								))}
							</div>
						</div>
					)}
				</div>
			) : (
				<>
					<div className='w-full'>
						<FiltrosCampanasMobile />
					</div>
					<div
						className='w-full h-[2px] my-3'
						style={{
							background: 'linear-gradient(90deg, #f43f5e 0%, #3b82f6 100%)',
						}}
					/>
					<div className='grid gap-6'>
						{lista_campanas.map(campana => (
							<CardCampanaHorizontal key={campana.id} campana={campana} />
						))}
					</div>
				</>
			)}
		</>
	);
}
