import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CampaignCardHorizontal from './campaignCardHorizontal';
import CampaignCardVertical from './campaignCardVertical';
import { Button, Checkbox, Input, Typography, Select, Option, IconButton } from '@material-tailwind/react';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import CampaignService from '../../services/CampaignService';

const CampaignFilter = () => {
	return (
		<div className='w-full max-w-[20rem] px-2 py-4 flex flex-col items-center'>
			<Typography variant='h5' color='blue-gray' className='font-bold tracking-wide mb-1'>
				Aquí irán los filtros
			</Typography>
			<div className='w-12 border-b-2 border-red-400 mb-4' />
			<Typography variant='small' color='red' className='text-center font-semibold mb-6'>
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
					<Button size='sm' color='red' className='shadow-md hover:scale-105 transition-transform font-bold px-6 py-2'>
						Filtrar
					</Button>
				</div>
			</div>
		</div>
	);
};

const CampaignFilterMobile = () => {
	const [open, setOpen] = useState(false);
	return (
		<div className='w-full px-2'>
			<button type='button' className='flex items-center justify-between w-full py-2' onClick={() => setOpen(!open)} aria-expanded={open}>
				<Typography variant='h6' color='blue-gray' className='font-bold'>
					Filtros
				</Typography>
				<span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
					<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='size-6'>
						<path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
					</svg>
				</span>
			</button>
			{open && (
				<div className='mt-2 flex flex-col items-center'>
					<Typography variant='small' color='red' className='text-center font-semibold mb-4'>
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
							<Button size='md' color='red' className='shadow-md hover:scale-105 transition-transform font-bold px-8 py-3'>
								Filtrar
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default function ListCampaigns({ isMobileSize, midSize }) {
	ListCampaigns.propTypes = {
		isMobileSize: PropTypes.bool.isRequired,
		midSize: PropTypes.bool.isRequired,
	};

	const [lista_campanas, setLista_campanas] = useState([]);
	useEffect(() => {
		CampaignService.getAllCampaigns()
			.then(response => {
				setLista_campanas(response.data);
			})
			.catch(error => {
				console.error('Error fetching campaigns:', error);
			});
	}, []);

	const [activePage, setActivePage] = useState(1);
	const itemsPerPage = 9;
	const totalPages = Math.ceil(lista_campanas.length / itemsPerPage);

	const paginatedCampanas = lista_campanas.slice(itemsPerPage * (activePage - 1), itemsPerPage * activePage);

	const getItemProps = index => ({
		variant: activePage === index ? 'filled' : 'text',
		color: 'gray',
		onClick: () => setActivePage(index),
	});

	const next = () => {
		if (activePage === totalPages) return;
		setActivePage(activePage + 1);
	};

	const prev = () => {
		if (activePage === 1) return;
		setActivePage(activePage - 1);
	};

	const Pagination = () => (
		<div className='flex items-center gap-4 justify-center mt-6'>
			<Button variant='text' className='flex items-center gap-2' onClick={prev} disabled={activePage === 1}>
				<ArrowLeftIcon strokeWidth={2} className='h-4 w-4' /> Anterior
			</Button>
			<div className='flex items-center gap-2'>
				{Array.from({ length: totalPages }, (_, i) => (
					<IconButton key={i + 1} {...getItemProps(i + 1)}>
						{i + 1}
					</IconButton>
				))}
			</div>
			<Button variant='text' className='flex items-center gap-2' onClick={next} disabled={activePage === totalPages}>
				Siguiente
				<ArrowRightIcon strokeWidth={2} className='h-4 w-4' />
			</Button>
		</div>
	);

	return (
		<>
			{!isMobileSize ? (
				<div className='flex flex-col md:flex-row gap-6'>
					{!midSize ? (
						<>
							<div className='w-full md:w-1/4'>
								<CampaignFilter />
							</div>

							<div className='w-full md:w-3/4 flex flex-col gap-6'>
								<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
									{paginatedCampanas.map(campana => (
										<CampaignCardVertical key={campana.id} campana={campana} />
									))}
								</div>

								<div className='w-full'>
									<Pagination />
								</div>
							</div>
						</>
					) : (
						<div className='w-full flex flex-col gap-3'>
							<div className='mt-3'>
								<CampaignFilterMobile />
							</div>

							<div
								className='w-full h-[2px] my-1'
								style={{
									background: 'linear-gradient(90deg, #f43f5e 0%, #3b82f6 100%)',
								}}
							/>

							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
								{paginatedCampanas.map(campana => (
									<CampaignCardVertical key={campana.id} campana={campana} />
								))}
							</div>
							<div className='w-full'>
								<Pagination />
							</div>
						</div>
					)}
				</div>
			) : (
				<>
					<div className='w-full'>
						<CampaignFilterMobile />
					</div>
					<div
						className='w-full h-[2px] my-3'
						style={{
							background: 'linear-gradient(90deg, #f43f5e 0%, #3b82f6 100%)',
						}}
					/>
					<div className='grid gap-6'>
						{paginatedCampanas.map(campana => (
							<CampaignCardHorizontal key={campana.id} campana={campana} />
						))}
					</div>
					<div className='w-full mt-4'>
						<Pagination />
					</div>
				</>
			)}
		</>
	);
}
