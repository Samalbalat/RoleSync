import {
	Button,
	Card,
	Rating,
	Typography,
	Accordion,
	AccordionHeader,
	AccordionBody,
} from '@material-tailwind/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import lista_campanas from '../../data/ejemplo_campañas.jsx';
import CampaignForum from '../forum/campaignForum.jsx';

export default function CampaignDetail({ isMobileSize, midSize, id_user }) {
	const { id } = useParams();
	const campaign = lista_campanas.find(c => c.id === parseInt(id));
	const title = campaign.title;
	const theme = campaign.tematica;
	const sistem = campaign.sistema;
	const description = campaign.descripcion;
	const ratingValue = Math.round(campaign.rate);
	const photo =
		campaign.photo ||
		'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';
	const comunication = campaign.comunicacion;
	const lenguage = campaign.idioma;
	const localitation = campaign.localizacion;
	const week_day = campaign.dia_semana;
	const frecuency = campaign.frecuencia;
	const gtm = campaign.horario_gtm;
	const num_people = campaign.num_personas;
	const duration = campaign.duracion;
	const ownerId = campaign.ownerId;
	const playerIds = campaign.playerIds || [];

	const [openAccordion, setOpenAccordion] = React.useState(false);
	const handleAccordion = () => setOpenAccordion(!openAccordion);

	function list_atributes() {
		return (
			<ul className='space-y-3'>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Idioma:</span>
					<span className='text-blue-gray-700 ml-2'>{lenguage}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Localización:</span>
					<span className='text-blue-gray-700 ml-2'>{localitation}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Comunicación:</span>
					<span className='text-blue-gray-700 ml-2'>{comunication}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Día semana:</span>
					<span className='text-blue-gray-700 ml-2'>{week_day}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Horario GTM:</span>
					<span className='text-blue-gray-700 ml-2'>{gtm}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Frecuencia:</span>
					<span className='text-blue-gray-700 ml-2'>{frecuency}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Duración:</span>
					<span className='text-blue-gray-700 ml-2'>{duration}</span>
				</li>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Participantes:</span>
					<span className='text-blue-gray-700 ml-2'>{num_people}</span>
				</li>
			</ul>
		);
	}

	function generalInfo() {
		return (
			<Card className='w-full p-8 rounded-3xl shadow-xl bg-white flex flex-col gap-8'>
				<div className='flex flex-col md:flex-row items-center gap-8'>
					<div className='w-44 h-44 bg-gray-100 flex items-center justify-center rounded-2xl border shadow-sm'>
						<img
							src={photo}
							alt='Foto campaña'
							className='w-full h-full object-cover rounded-2xl'
						/>
					</div>
					<div className='flex flex-col items-center md:items-start text-center md:text-left gap-2 w-full'>
						<Typography
							variant='h1'
							className='font-bold text-blue-gray-900 mb-1 text-3xl md:text-4xl'
						>
							{title}
						</Typography>
						<Typography
							variant='h4'
							className='text-blue-gray-600 mb-1 text-xl'
						>
							{sistem}
						</Typography>
						<Typography
							variant='h5'
							className='text-blue-gray-500 mb-1 text-lg'
						>
							{theme}
						</Typography>
						<div className='flex items-center gap-2 mt-2'>
							<Rating value={ratingValue} readonly size='md' />
							<span className='text-blue-gray-500 text-sm'>
								({ratingValue}/5)
							</span>
						</div>
					</div>
				</div>
				<div className='rounded-2xl p-6 bg-blue-gray-50 min-h-[120px] flex items-center justify-center shadow-sm'>
					<span className='text-base text-blue-gray-700 max-w-2xl text-center'>
						{description}
					</span>
				</div>
			</Card>
		);
	}

	// Vista para movil
	if (isMobileSize) {
		return (
			<div className='flex flex-col gap-6 items-center w-full max-w-md mx-auto px-2'>
				<Card className='w-full p-4 rounded-2xl shadow-xl bg-white flex flex-col gap-4 items-center'>
					<div className='w-32 h-32 bg-gray-100 flex items-center justify-center rounded-xl border shadow-sm mb-2'>
						<img
							src={photo}
							alt='Foto campaña'
							className='w-full h-full object-cover rounded-xl'
						/>
					</div>
					<Typography
						variant='h3'
						className='font-bold text-blue-gray-900 mb-1 text-xl text-center'
					>
						{title}
					</Typography>
					<Typography
						variant='h5'
						className='text-blue-gray-600 mb-1 text-base text-center'
					>
						{sistem}
					</Typography>
					<Typography
						variant='h6'
						className='text-blue-gray-500 mb-1 text-sm text-center'
					>
						{theme}
					</Typography>
					<div className='flex items-center gap-2 mt-1 justify-center'>
						<Rating value={ratingValue} readonly size='sm' />
						<span className='text-blue-gray-500 text-xs'>
							({ratingValue}/5)
						</span>
					</div>
					<Card className='w-full p-4 rounded-2xl bg-blue-gray-50 shadow-sm flex items-center justify-center'>
						<span className='text-base text-blue-gray-700 text-center'>
							{description}
						</span>
					</Card>
				</Card>

				<Accordion
					open={openAccordion}
					className='w-full mb-2 rounded-lg border border-blue-gray-100 px-2'
				>
					<AccordionHeader
						onClick={handleAccordion}
						className={`border-b-0 text-blue-gray-600 transition-colors ${openAccordion ? 'text-red-900 hover:!text-red-900' : ''}`}
					>
						<Typography variant='h5' className='ml-2 text-base text-center'>
							Detalles de la campaña
						</Typography>
					</AccordionHeader>
					<AccordionBody className='pt-0 text-base font-normal'>
						{list_atributes()}
					</AccordionBody>
				</Accordion>

				{ownerId !== id_user && playerIds.includes(id_user) && (
					<>
						<CampaignForum />
						<Button color='red' size='lg' className='w-full mt-1'>
							Salir del Rol
						</Button>
					</>
				)}
				{ownerId !== id_user && !playerIds.includes(id_user) && (
					<Button color='green' size='lg' className='w-full mt-1'>
						Solicitar
					</Button>
				)}
				{ownerId === id_user && (
					<>
						<CampaignForum />
						<Button color='blue' size='lg' className='w-full mt-1'>
							Editar campaña
						</Button>
					</>
				)}
			</div>
		);
	}

	// Vista para desktop (tamaño medio)
	if (midSize && !isMobileSize) {
		return (
			<div className='flex flex-col gap-6 items-start w-full max-w-6xl mx-auto'>
				{generalInfo()}
				{ownerId !== id_user && playerIds.includes(id_user) && (
					<CampaignForum />
				)}
				{ownerId === id_user && <CampaignForum />}
				<Accordion
					open={openAccordion}
					className='w-full mb-1 rounded-lg border border-blue-gray-100 px-2 mt-1'
				>
					<AccordionHeader
						onClick={handleAccordion}
						className={`border-b-0 text-blue-gray-600 transition-colors ${openAccordion ? 'text-red-900 hover:!text-red-900' : ''}`}
					>
						<Typography variant='h5' className='ml-2 text-base text-center'>
							Detalles de la campaña
						</Typography>
					</AccordionHeader>
					<AccordionBody className='pt-0 text-base font-normal'>
						{list_atributes()}
					</AccordionBody>
				</Accordion>

				{ownerId !== id_user && playerIds.includes(id_user) && (
					<Button color='red'>Salir del Rol</Button>
				)}
				{ownerId !== id_user && !playerIds.includes(id_user) && (
					<Button color='green'>Solicitar</Button>
				)}
				{ownerId === id_user && <Button color='blue'>Editar campaña</Button>}
			</div>
		);
	}
	// Vista para desktop
	return (
		<div className='flex flex-col md:flex-row gap-10 items-start w-full max-w-6xl mx-auto'>
			<div className='w-full md:w-3/4 flex flex-col gap-6'>
				{generalInfo()}
				{ownerId !== id_user && playerIds.includes(id_user) && (
					<CampaignForum />
				)}
				{ownerId === id_user && <CampaignForum />}
			</div>
			<div className='w-full md:w-1/4 flex flex-col gap-6'>
				<Card className='w-full p-6 rounded-2xl shadow-lg bg-gray-50'>
					{list_atributes()}
				</Card>
				{ownerId !== id_user && playerIds.includes(id_user) && (
					<Button color='red'>Salir del Rol</Button>
				)}
				{ownerId !== id_user && !playerIds.includes(id_user) && (
					<Button color='green'>Solicitar</Button>
				)}
				{ownerId === id_user && <Button color='blue'>Editar campaña</Button>}
			</div>
		</div>
	);
}
