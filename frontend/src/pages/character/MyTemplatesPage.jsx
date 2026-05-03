import { useEffect, useState } from 'react';
import { Typography, Spinner, Card, CardBody, Avatar, IconButton, Tooltip } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTheme } from '../../utils/themeUtils';
import { useAuth } from '../../utils/AuthContext';
import characterService from '../../services/CharacterService';
import { DocumentDuplicateIcon, PencilIcon } from '@heroicons/react/24/outline';

function LoadingScreen() {
	const theme = getTheme();
	return (
		<div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
			<Spinner className={`h-12 w-12 ${theme.textSecondary}`} color={theme.secondary} />
		</div>
	);
}

export default function MyTemplatesPage() {
	const { activeProfile } = useAuth();
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();
	const location = useLocation();

	const [templates, setTemplates] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setLoading(true);
				const templateData = await characterService.getMyTemplates();
				console.log('Plantillas obtenidas del backend:', templateData);
				setTemplates(Array.isArray(templateData) ? templateData : []);
			} catch (error) {
				console.error('Error cargando plantillas:', error);
			} finally {
				setLoading(false);
			}
		};

		if (activeProfile) {
			fetchTemplates();
		}
	}, [activeProfile]);

	const handleEditTemplate = templateId => {
		navigate(`/character/templateBuilder?templateId=${templateId}`, { state: { from: location.pathname } });
	};

	const formatFieldType = type => {
		if (type === 'short_text') {
			return t('templates.fieldType.shortText', 'Texto Corto');
		} else if (type === 'long_text') {
			return t('templates.fieldType.longText', 'Texto Largo');
		} else if (type === 'number') {
			return t('templates.fieldType.number', 'Número');
		} else if (type === 'boolean') {
			return t('templates.fieldType.boolean', 'Checkbox');
		}
		if (!type) return '';
		return type.replace('_', ' ');
	};

	if (loading) return <LoadingScreen />;

	return (
		<div className='max-w-7xl mx-auto px-4 py-8'>
			<div className='mb-8 border-b border-gray-200 pb-4'>
				<Typography variant='h3' color='blue-gray' className='flex items-center gap-3'>
					<DocumentDuplicateIcon className={`w-8 h-8 ${theme.textPrimary}`} />
					{t('home.myTemplates.title', 'Mis Plantillas')}
				</Typography>
				<Typography variant='paragraph' className='text-gray-500 mt-2'>
					{t('home.myTemplates.description', 'Aquí puedes gestionar tus plantillas base para crear personajes.')}
				</Typography>
			</div>

			<div className='bg-white rounded-xl shadow-sm border border-blue-gray-50 p-6'>
				{templates.length > 0 ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{templates.map(template => {
							const fields = template.schema_definition || [];
							const maxVisibleFields = 4;
							const visibleFields = fields.slice(0, maxVisibleFields);
							const remainingFields = fields.length - maxVisibleFields;

							return (
								<Card
									key={template.id}
									className='w-full relative hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col'
								>
									<div className='absolute top-2 right-2 z-10'>
										<Tooltip content={t('common.edit', 'Editar plantilla')}>
											<IconButton
												variant='text'
												color='blue-gray'
												className='rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100'
												onClick={() => handleEditTemplate(template.id)}
											>
												<PencilIcon className='h-5 w-5' />
											</IconButton>
										</Tooltip>
									</div>

									<CardBody className='flex flex-col flex-grow p-5'>
										<div className='flex flex-col items-center text-center mb-4'>
											<Avatar
												src={`https://ui-avatars.com/api/?name=${encodeURIComponent(template.name)}&background=random&color=fff`}
												alt={template.name}
												variant='rounded'
												className='h-16 w-16 mb-3 shadow-sm border border-gray-200'
											/>

											<Typography variant='h6' color='blue-gray' className='mb-1 w-full truncate' title={template.name}>
												{template.name}
											</Typography>

											{template.campaign_name ? (
												<div
													className={`bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-xs font-semibold max-w-full truncate`}
													title={template.campaign_name}
												>
													{template.campaign_name}
												</div>
											) : (
												<div className='bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-xs font-medium max-w-full truncate'>
													{t('templates.global', 'Plantilla Global')}
												</div>
											)}
										</div>

										<div className='mt-auto pt-4 border-t border-gray-100'>
											{/* Hemos devuelto tu diseño de "contador total" arriba de la lista */}
											<Typography
												variant='small'
												className='text-gray-500 font-medium mb-3 bg-gray-50 w-full py-1 rounded border border-gray-100 text-center'
											>
												{fields.length} {t('templates.fieldsCount', 'campos en total')}
											</Typography>

											{fields.length > 0 ? (
												<div className='bg-gray-50/50 rounded-md p-2 border border-gray-50'>
													<ul className='flex flex-col gap-1.5'>
														{/* Solo mapeamos los primeros 4 */}
														{visibleFields.map((field, idx) => (
															<li key={field.key || idx} className='flex justify-between items-center text-xs'>
																<span className='font-medium text-gray-700 truncate pr-2' title={field.label}>
																	{field.label}
																</span>
																<span className='text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-sm uppercase whitespace-nowrap flex-shrink-0'>
																	{formatFieldType(field.type)}
																</span>
															</li>
														))}

														{/* Si hay más de 4, mostramos este pequeño footer en la lista */}
														{remainingFields > 0 && (
															<li className='text-center pt-2 mt-1 border-t border-gray-200/60'>
																<Typography variant='small' className='text-xs text-gray-400 italic font-medium'>
																	... y {remainingFields} {remainingFields === 1 ? 'campo más' : 'campos más'}
																</Typography>
															</li>
														)}
													</ul>
												</div>
											) : (
												<div className='bg-gray-50 rounded-md p-2 text-center border border-gray-100'>
													<Typography variant='small' className='text-gray-400 italic'>
														{t('templates.noFields', 'Sin campos')}
													</Typography>
												</div>
											)}
										</div>
									</CardBody>
								</Card>
							);
						})}
					</div>
				) : (
					<div className='text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
						<DocumentDuplicateIcon className='w-12 h-12 text-gray-400 mx-auto mb-3' />
						<Typography className='italic text-gray-500'>
							{t('profile.noTemplates', 'No tienes plantillas creadas todavía.')}
						</Typography>
					</div>
				)}
			</div>
		</div>
	);
}
