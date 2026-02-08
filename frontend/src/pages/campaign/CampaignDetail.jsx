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
import CampaignForum from '../forum/CampaignForum.jsx';
import CampaignService from '../../services/CampaignService.js';
import parseRpgSystem from '../../data/RPGSystem.jsx';

export default function CampaignDetail({ isMobileSize, midSize, user_email }) {
	const { id } = useParams();

	const [campaign, setCampaign] = React.useState([]);
	React.useEffect(() => {
		CampaignService.getCampaignById(id)
			.then(response => {
				setCampaign(response.data);
			})
			.catch(error => {
				console.error('Error fetching campaign:', error);
			});
	}, [id]);

	const name = campaign.name;
	const theme = campaign.theme;
	const rpgsystem = parseRpgSystem(campaign.rpgsystem);
	const description = campaign.description;
	const image =
		campaign.image ||
		'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';
	const communications = campaign.communications;
	const languages = campaign.languages;
	const weekDay = campaign.weekDay;
	const frecuency = campaign.frecuency;
	const timeZone = campaign.timeZone;
	const duration = campaign.duration;
	const owner = campaign.owner;
	const members = campaign.members || [];

	const [openAccordion, setOpenAccordion] = React.useState(false);
	const handleAccordion = () => setOpenAccordion(!openAccordion);

	function list_atributes() {
		return (
			<ul className='space-y-3'>
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Idioma:</span>
					<span className='text-blue-gray-700 ml-2'>
						{(languages || []).join(', ')}
					</span>
				</li>

				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Comunicación:</span>
					<span className='text-blue-gray-700 ml-2'>
						{(communications || []).join(', ')}
					</span>
				</li>
				{weekDay && (
					<li className='flex items-center gap-2 text-sm'>
						<span className='font-bold text-blue-gray-700'>Día semana:</span>
						<span className='text-blue-gray-700 ml-2'>{weekDay}</span>
					</li>
				)}
				<li className='flex items-center gap-2 text-sm'>
					<span className='font-bold text-blue-gray-700'>Horario GTM:</span>
					<span className='text-blue-gray-700 ml-2'>{timeZone}</span>
				</li>
				{frecuency && (
					<li className='flex items-center gap-2 text-sm'>
						<span className='font-bold text-blue-gray-700'>Frecuencia:</span>
						<span className='text-blue-gray-700 ml-2'>{frecuency}</span>
					</li>
				)}
				{duration && (
					<li className='flex items-center gap-2 text-sm'>
						<span className='font-bold text-blue-gray-700'>Duración:</span>
						<span className='text-blue-gray-700 ml-2'>{duration}</span>
					</li>
				)}
			</ul>
		);
	}

	function generalInfo() {
		return (
			<Card className='w-full p-8 rounded-3xl shadow-xl bg-white flex flex-col gap-8'>
				<div className='flex flex-col md:flex-row items-center gap-8'>
					<div className='w-44 h-44 bg-gray-100 flex items-center justify-center rounded-2xl border shadow-sm'>
						<img
							src={image}
							alt='Foto campaña'
							className='w-full h-full object-cover rounded-2xl'
						/>
					</div>
					<div className='flex flex-col items-center md:items-start text-center md:text-left gap-2 w-full'>
						<Typography
							variant='h1'
							className='font-bold text-blue-gray-900 mb-1 text-3xl md:text-4xl'
						>
							{name || ''}
						</Typography>
						<Typography
							variant='h4'
							className='text-blue-gray-600 mb-1 text-xl'
						>
							{rpgsystem || ''}
						</Typography>
						<Typography
							variant='h5'
							className='text-blue-gray-500 mb-1 text-lg'
						>
							{theme || ''}
						</Typography>
						<div className='flex items-center gap-2 mt-2'>
							<Rating value={4} readonly size='md' />
							<span className='text-blue-gray-500 text-sm'>({4}/5)</span>
						</div>
					</div>
				</div>
				<div className='rounded-2xl p-6 bg-blue-gray-50 min-h-[120px] flex items-center justify-center shadow-sm'>
					<span className='text-base text-blue-gray-700 max-w-2xl text-center'>
						{description || ''}
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
							src={image}
							alt='Foto campaña'
							className='w-full h-full object-cover rounded-xl'
						/>
					</div>
					<Typography
						variant='h3'
						className='font-bold text-blue-gray-900 mb-1 text-xl text-center'
					>
						{name}
					</Typography>
					<Typography
						variant='h5'
						className='text-blue-gray-600 mb-1 text-base text-center'
					>
						{rpgsystem}
					</Typography>
					<Typography
						variant='h6'
						className='text-blue-gray-500 mb-1 text-sm text-center'
					>
						{theme}
					</Typography>
					<div className='flex items-center gap-2 mt-1 justify-center'>
						<Rating value={4} readonly size='sm' />
						<span className='text-blue-gray-500 text-xs'>({4}/5)</span>
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

				{owner?.email !== user_email &&
					members.some(m => m.email === user_email) && (
						<>
							<CampaignForum />
							<Button color='red' size='lg' className='w-full mt-1'>
								Salir del Rol
							</Button>
						</>
					)}
				{owner?.email !== user_email &&
					!members.some(m => m.email === user_email) && (
						<Button color='green' size='lg' className='w-full mt-1'>
							Solicitar
						</Button>
					)}
				{owner?.email === user_email && (
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
				{owner?.email !== user_email &&
					members.some(m => m.email === user_email) && <CampaignForum />}
				{owner?.email === user_email && <CampaignForum />}
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

				{owner?.email !== user_email &&
					members.some(m => m.email === user_email) && (
						<Button color='red'>Salir del Rol</Button>
					)}
				{owner?.email !== user_email &&
					!members.some(m => m.email === user_email) && (
						<Button color='green'>Solicitar</Button>
					)}
				{owner?.email === user_email && (
					<Button color='blue'>Editar campaña</Button>
				)}
			</div>
		);
	}
	// Vista para desktop
	return (
		<div className='flex flex-col md:flex-row gap-10 items-start w-full max-w-6xl mx-auto'>
			<div className='w-full md:w-3/4 flex flex-col gap-6'>
				{generalInfo()}
				{owner?.email !== user_email &&
					members.some(m => m.email === user_email) && <CampaignForum />}
				{owner?.email === user_email && <CampaignForum />}
			</div>
			<div className='w-full md:w-1/4 flex flex-col gap-6'>
				<Card className='w-full p-6 rounded-2xl shadow-lg bg-gray-50'>
					{list_atributes()}
				</Card>
				{owner?.email !== user_email &&
					members.some(m => m.email === user_email) && (
						<Button color='red'>Salir del Rol</Button>
					)}
				{owner?.email !== user_email &&
					!members.some(m => m.email === user_email) && (
						<Button color='green'>Solicitar</Button>
					)}
				{owner?.email === user_email && (
					<Button color='blue'>Editar campaña</Button>
				)}
			</div>
		</div>
	);
}
