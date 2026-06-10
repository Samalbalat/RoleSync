import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	Dialog,
	DialogHeader,
	DialogBody,
	Typography,
	Card,
	CardBody,
	IconButton,
	Spinner,
	List,
	ListItem,
} from '@material-tailwind/react';
import {
	DocumentPlusIcon,
	DocumentDuplicateIcon,
	BookOpenIcon,
	XMarkIcon,
	ArrowLeftIcon,
	EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CharacterService from '../../../services/CharacterService';

export default function CreateTemplateModal({ isOpen, onClose, campaignId, navigate, t, location }) {
	const [currentView, setCurrentView] = useState('options');
	const [myTemplates, setMyTemplates] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setCurrentView('options');
			setMyTemplates([]);
		}
	}, [isOpen]);

	// --- NAVEGACIÓN PRINCIPAL ---
	const handleCreateFromScratch = () => {
		onClose();
		navigate(`/character/templateBuilder?campaignId=${campaignId}`, { state: { from: location.pathname } });
	};

	const handleUsePreset = presetId => {
		onClose();
		navigate(`/character/templateBuilder?campaignId=${campaignId}&preset=${presetId}`, {
			state: { from: location.pathname },
		});
	};

	// --- LÓGICA DE MIS PLANTILLAS ---
	const handleLoadMyTemplates = async () => {
		setCurrentView('my_templates');
		setIsLoading(true);
		try {
			const templates = await CharacterService.getMyTemplates();
			setMyTemplates(templates || []);
		} catch (error) {
			console.error('Error al cargar mis plantillas', error);
			toast.error(t('character.templateBuilder.errorLoadTemplates', 'Error al cargar tus plantillas.'));
			setCurrentView('options'); // Si falla, le devolvemos a la pantalla principal
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectTemplate = template => {
		onClose();
		navigate(`/character/templateBuilder?campaignId=${campaignId}&cloneId=${template.id}`, {
			state: { from: location.pathname },
		});
	};

	return (
		<Dialog open={isOpen} handler={onClose} size='sm' className='p-2'>
			<DialogHeader className='flex justify-between items-center pb-0'>
				<div className='flex items-center gap-2'>
					{currentView !== 'options' && (
						<IconButton variant='text' size='sm' onClick={() => setCurrentView('options')}>
							<ArrowLeftIcon className='h-5 w-5' />
						</IconButton>
					)}
					<Typography variant='h4' color='blue-gray'>
						{currentView === 'options'
							? t('character.templateBuilder.chooseStartingPoint', 'Elegir punto de partida')
							: t('character.templateBuilder.selectTemplate', 'Selecciona una plantilla')}
					</Typography>
				</div>
				<IconButton color='blue-gray' size='sm' variant='text' onClick={onClose}>
					<XMarkIcon className='h-5 w-5' />
				</IconButton>
			</DialogHeader>

			<DialogBody className='flex flex-col gap-4 pt-4 h-[400px] overflow-y-auto'>
				{/* VISTA 1: OPCIONES */}
				{currentView === 'options' && (
					<>
						<Card
							className='cursor-pointer border border-blue-gray-100 hover:border-blue-500 hover:shadow-md transition-all'
							onClick={handleCreateFromScratch}
						>
							<CardBody className='flex items-center gap-4 p-4'>
								<div className='p-3 bg-blue-50 text-blue-500 rounded-lg'>
									<DocumentPlusIcon className='h-6 w-6' />
								</div>
								<div>
									<Typography variant='h6' color='blue-gray'>
										{t('character.templateBuilder.fromScratch', 'Desde Cero')}
									</Typography>
									<Typography variant='small' color='gray' className='font-normal'>
										{t('character.templateBuilder.fromScratchDesc', 'Crea una plantilla con tus propios campos.')}
									</Typography>
								</div>
							</CardBody>
						</Card>
						<Card
							className='cursor-pointer border border-blue-gray-100 hover:border-green-500 hover:shadow-md transition-all'
							onClick={handleLoadMyTemplates}
						>
							<CardBody className='flex items-center gap-4 p-4'>
								<div className='p-3 bg-green-50 text-green-500 rounded-lg'>
									<DocumentDuplicateIcon className='h-6 w-6' />
								</div>
								<div>
									<Typography variant='h6' color='blue-gray'>
										{t('character.templateBuilder.copyMine', 'Copiar mis plantillas')}
									</Typography>
									<Typography variant='small' color='gray' className='font-normal'>
										{t('character.templateBuilder.copyMineDesc', 'Usa una plantilla de otra de tus campañas.')}
									</Typography>
								</div>
							</CardBody>
						</Card>
						<Card
							className='cursor-pointer border border-blue-gray-100 hover:border-orange-500 hover:shadow-md transition-all'
							onClick={() => handleUsePreset('dnd5e')}
						>
							<CardBody className='flex items-center gap-4 p-4'>
								<div className='p-3 bg-orange-50 text-orange-500 rounded-lg'>
									<BookOpenIcon className='h-6 w-6' />
								</div>
								<div>
									<Typography variant='h6' color='blue-gray'>
										{t('character.templateBuilder.presetDnD', 'Plantilla D&D 5e')}
									</Typography>
									<Typography variant='small' color='gray' className='font-normal'>
										{t('character.templateBuilder.presetDnDDesc', 'Estructura base para Dungeons & Dragons.')}
									</Typography>
								</div>
							</CardBody>
						</Card>

						<Card
							className='cursor-pointer border border-blue-gray-100 hover:border-purple-500 hover:shadow-md transition-all'
							onClick={() => handleUsePreset('cthulhu7e')}
						>
							<CardBody className='flex items-center gap-4 p-4'>
								<div className='p-3 bg-purple-50 text-purple-500 rounded-lg'>
									<EyeIcon className='h-6 w-6' />
								</div>
								<div>
									<Typography variant='h6' color='blue-gray'>
										{t('character.templateBuilder.presetCthulhu', 'Plantilla Cthulhu 7ª Ed.')}
									</Typography>
									<Typography variant='small' color='gray' className='font-normal'>
										{t('character.templateBuilder.presetCthulhuDesc', 'Estructura base para La Llamada de Cthulhu.')}
									</Typography>
								</div>
							</CardBody>
						</Card>
					</>
				)}

				{/* VISTA 2: LISTA DE PLANTILLAS */}
				{currentView === 'my_templates' && (
					<div className='flex flex-col h-full'>
						{isLoading ? (
							<div className='flex-1 flex flex-col items-center justify-center gap-4'>
								<Spinner className='h-8 w-8 text-green-500' />
								<Typography color='gray'>{t('common.loading', 'Cargando...')}</Typography>
							</div>
						) : myTemplates.length === 0 ? (
							<div className='flex-1 flex flex-col items-center justify-center text-center p-4'>
								<DocumentDuplicateIcon className='h-12 w-12 text-gray-300 mb-2' />
								<Typography color='gray'>
									{t('character.templateBuilder.noTemplates', 'No tienes plantillas creadas todavía.')}
								</Typography>
							</div>
						) : (
							<List className='p-0'>
								{myTemplates.map(template => (
									<ListItem
										key={template.id}
										className='flex justify-between items-center border-b border-gray-300 last:border-none py-3'
										onClick={() => handleSelectTemplate(template)}
									>
										<div>
											<Typography variant='h6' color='blue-gray'>
												{template.name}
											</Typography>
											<Typography variant='small' color='gray'>
												{t('campaign.title', 'Campaña')}:{' '}
												<span className='font-medium text-blue-500'>{template.campaign_name}</span>
											</Typography>
										</div>
									</ListItem>
								))}
							</List>
						)}
					</div>
				)}
			</DialogBody>
		</Dialog>
	);
}

CreateTemplateModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	navigate: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	location: PropTypes.shape({
		pathname: PropTypes.string.isRequired,
	}).isRequired,
};
