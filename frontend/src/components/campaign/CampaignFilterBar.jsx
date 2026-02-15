import React, { useState, useRef, useEffect } from 'react';
import { Input, Select, Option, Button, Typography } from '@material-tailwind/react';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function CampaignFilterBar({ filters, setFilters, onClean, theme }) {
	const { t } = useTranslation('global');
	const [openFilters, setOpenFilters] = useState(false);
	const containerRef = useRef(null);

	const handleChange = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
	const isWritten = theme.primary === 'indigo';

	// Cerrar el menú si haces clic fuera de él
	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setOpenFilters(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [containerRef]);

	const fixedMenuProps = {
		placement: 'bottom',
		className: 'max-h-[300px] overflow-y-auto',
	};

	return (
		<div className='w-full mb-8 relative z-30' ref={containerRef}>
			{/* 1. BARRA SUPERIOR (Buscador) */}
			<div className='bg-white p-2 md:p-6 rounded-xl shadow-sm border border-gray-100 flex gap-2 md:gap-4 items-center relative z-20'>
				<div className='flex-grow'>
					<Input
						label={t('filter.searchLabel')}
						icon={<MagnifyingGlassIcon />}
						value={filters.name}
						onChange={e => handleChange('name', e.target.value)}
						color={theme.primary}
						className='!border-t-blue-gray-200 focus:!border-t-gray-900'
					/>
				</div>
				<Button
					variant={openFilters ? 'filled' : 'outlined'}
					color={theme.primary}
					onClick={() => setOpenFilters(!openFilters)}
					className='flex items-center gap-2 whitespace-nowrap min-w-[120px] justify-center'
				>
					{openFilters ? (
						<>
							<XMarkIcon className='h-4 w-4' /> {t('filter.close')}
						</>
					) : (
						<>
							<AdjustmentsHorizontalIcon className='h-4 w-4' /> {t('filter.filter')}
						</>
					)}
				</Button>
			</div>

			{/* 2. PANEL FLOTANTE (OVERLAY) */}

			{openFilters && (
				<div className='absolute top-full left-0 w-full mt-2 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in-down'>
					<div className='flex justify-between items-center mb-4'>
						<Typography variant='h6' color='blue-gray'>
							{t('filter.filter')} {isWritten ? 'Narrativos' : 'de Mesa'}
						</Typography>
						<Button variant='text' size='sm' color='red' className='flex items-center gap-2' onClick={onClean}>
							<TrashIcon className='h-4 w-4' /> {t('filter.cleanFilters')}
						</Button>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						{/* --- CAMPOS COMUNES --- */}
						<Input
							label={t('campaign.theme')}
							placeholder={t('campaign.themePlaceholder')}
							value={filters.theme}
							onChange={e => handleChange('theme', e.target.value)}
							color={theme.primary}
						/>

						<Input
							label={t('campaign.communication')}
							placeholder={t('campaign.communicationPlaceholder')}
							value={filters.communication}
							onChange={e => handleChange('communication', e.target.value)}
							color={theme.primary}
						/>

						<Select
							label={t('campaign.language')}
							value={filters.language}
							onChange={val => handleChange('language', val)}
							color={theme.primary}
							menuProps={fixedMenuProps}
						>
							<Option value='Español'>Español</Option>
							<Option value='Inglés'>Inglés</Option>
						</Select>

						<Select
							label={t('campaign.timeZone')}
							value={filters.timeZone}
							onChange={val => handleChange('timeZone', val)}
							color={theme.primary}
							menuProps={fixedMenuProps}
						>
							<Option value='GMT+1 (España)'>Europa (GMT+1)</Option>
							<Option value='GMT-5 (Latam)'>Latam (GMT-5)</Option>
							<Option value='N/A (Asíncrono)'>Asíncrono</Option>
						</Select>

						{/* --- CAMPOS SOLO PARA TABLETOP --- */}
						{!isWritten && (
							<>
								<Select
									label={t('campaign.system')}
									value={filters.system}
									onChange={val => handleChange('system', val)}
									color={theme.primary}
									menuProps={fixedMenuProps}
								>
									<Option value='D&D 5e'>D&D 5e</Option>
									<Option value='Pathfinder'>Pathfinder</Option>
									<Option value='Vampiro'>Vampiro</Option>
									<Option value='Call of Cthulhu'>Cthulhu</Option>
								</Select>

								<Input
									label={t('campaign.location')}
									placeholder={t('campaign.locationPlaceholder')}
									value={filters.location}
									onChange={e => handleChange('location', e.target.value)}
									color={theme.primary}
								/>

								<Select
									label={t('campaign.schedule')}
									value={filters.schedule}
									onChange={val => handleChange('schedule', val)}
									color={theme.primary}
									menuProps={fixedMenuProps}
								>
									<Option value='Viernes Noche'>Viernes</Option>
									<Option value='Sábados Tarde'>Sábados</Option>
								</Select>

								<Select
									label={t('campaign.duration')}
									value={filters.duration}
									onChange={val => handleChange('duration', val)}
									color={theme.primary}
									menuProps={fixedMenuProps}
								>
									<Option value='One-Shot'>One-Shot</Option>
									<Option value='Corta'>Corta (1-3 meses)</Option>
									<Option value='Larga (+6 meses)'>Larga (+6 meses)</Option>
								</Select>
							</>
						)}
					</div>

					<div className='mt-6 flex justify-end'>
						<Button
							className='w-full md:w-auto'
							variant='gradient'
							color={theme.primary}
							onClick={() => setOpenFilters(false)}
						>
							{t('filter.applyFilters')}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

CampaignFilterBar.propTypes = {
	filters: PropTypes.object.isRequired,
	setFilters: PropTypes.func.isRequired,
	onClean: PropTypes.func.isRequired,
	theme: PropTypes.object.isRequired,
};
