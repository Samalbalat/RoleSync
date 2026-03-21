import React, { useState, useRef, useEffect } from 'react';
import { Input, Select, Option, Button, Typography } from '@material-tailwind/react';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function CampaignFilterBar({ filters, setFilters, onClean, onSearch, theme }) {
	const { t } = useTranslation('global');
	const [openFilters, setOpenFilters] = useState(false);
	const containerRef = useRef(null);

	const handleChange = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
	const isWritten = theme.primary === 'indigo';

	const handleKeyDown = e => {
		if (e.key === 'Enter') {
			onSearch();
		}
	};
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
						icon={<MagnifyingGlassIcon className='cursor-pointer' onClick={onSearch} />}
						value={filters.search}
						onChange={e => handleChange('search', e.target.value)}
						onKeyDown={handleKeyDown}
						color={theme.primary}
					/>
				</div>
				<Button color={theme.primary} onClick={onSearch} className='flex items-center gap-2'>
					<MagnifyingGlassIcon className='h-4 w-4' />
					<span className='hidden md:inline'>{t('common.search')}</span>
				</Button>

				<Button
					variant={openFilters ? 'filled' : 'outlined'}
					color={theme.primary}
					onClick={() => setOpenFilters(!openFilters)}
					className='flex items-center gap-2 whitespace-nowrap'
				>
					{openFilters ? (
						<>
							<XMarkIcon className='h-4 w-4' />
							{t('filter.close')}
						</>
					) : (
						<>
							<AdjustmentsHorizontalIcon className='h-4 w-4' />
							{t('filter.filter')}
						</>
					)}
				</Button>
			</div>

			{/* 2. PANEL FLOTANTE (OVERLAY) */}

			{openFilters && (
				<div className='absolute top-full left-0 w-full mt-2 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in-down'>
					<div className='flex justify-between items-center mb-4'>
						<Typography variant='h6' color='blue-gray'>
							{t('filter.filter')} {isWritten ? t('campaign.campaignNarrative') : t('campaign.campaignTable')}
						</Typography>
						<Button variant='text' size='sm' color='red' className='flex items-center gap-2' onClick={onClean}>
							<TrashIcon className='h-4 w-4' /> {t('filter.cleanFilters')}
						</Button>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						{/* --- CAMPOS COMUNES --- */}
						<Input
							label={t('campaign.themes')}
							placeholder={t('campaign.placeholder.themes')}
							value={filters.themes}
							onChange={e => handleChange('themes', e.target.value)}
							color={theme.primary}
						/>

						<Select
							label={t('campaign.communication')}
							placeholder={t('campaign.placeholder.communication')}
							value={filters.communication}
							onChange={val => handleChange('communication', val)}
							color={theme.primary}
						>
							{[
								isWritten ? (
									<Option key='here' value='here'>
										{t('communication.here')}
									</Option>
								) : null,
								<Option key='discord' value='Discord'>
									Discord
								</Option>,
								<Option key='twitter' value='Twitter'>
									Twitter / X
								</Option>,
								<Option key='telegram' value='Telegram'>
									Telegram
								</Option>,
								<Option key='whatsapp' value='WhatsApp'>
									WhatsApp
								</Option>,
								<Option key='in-person' value='In-person'>
									{t('communication.inPerson')}
								</Option>,
								<Option key='other' value='Other'>
									{t('communication.other')}
								</Option>,
							].filter(Boolean)}
						</Select>

						<Select
							label={t('campaign.language')}
							value={filters.language}
							onChange={val => handleChange('language', val)}
							color={theme.primary}
							menuProps={fixedMenuProps}
						>
							<Option value='Español'>Español</Option>
							<Option value='English'>English</Option>
							<Option value='Français'>Français</Option>
							<Option value='Deutsch'>Deutsch</Option>
							<Option value='Italiano'>Italiano</Option>
							<Option value='Português'>Português</Option>
							<Option value='Other'>Other</Option>
						</Select>

						<Select
							label={t('campaign.timeZone')}
							value={filters.timeZone}
							onChange={val => handleChange('timeZone', val)}
							color={theme.primary}
							menuProps={fixedMenuProps}
						>
							<Option value='GMT'>GMT (Europa Occidental)</Option>
							<Option value='CET'>CET (Europa Central)</Option>
							<Option value='EST'>EST (EEUU Costa Este)</Option>
							<Option value='PST'>PST (EEUU Costa Oeste)</Option>
							<Option value='UTC-3'>UTC-3 (Argentina/Uruguay)</Option>
						</Select>

						{/* --- CAMPOS SOLO PARA TABLETOP --- */}
						{!isWritten && (
							<>
								<Input
									label={t('campaign.system')}
									value={filters.system}
									onChange={e => handleChange('system', e.target.value)}
									color={theme.primary}
								/>

								<Input
									label={t('campaign.location')}
									placeholder={t('campaign.placeholder.location')}
									value={filters.location}
									onChange={e => handleChange('location', e.target.value)}
									color={theme.primary}
								/>

								<Select
									label={t('campaign.dayWeek')}
									value={filters.dayWeek}
									onChange={val => handleChange('dayWeek', val)}
									color={theme.primary}
									menuProps={fixedMenuProps}
								>
									<Option value='monday'>{t('dayWeek.monday')}</Option>
									<Option value='tuesday'>{t('dayWeek.tuesday')}</Option>
									<Option value='wednesday'>{t('dayWeek.wednesday')}</Option>
									<Option value='thursday'>{t('dayWeek.thursday')}</Option>
									<Option value='friday'>{t('dayWeek.friday')}</Option>
									<Option value='saturday'>{t('dayWeek.saturday')}</Option>
									<Option value='sunday'>{t('dayWeek.sunday')}</Option>
								</Select>

								<Input
									label={t('campaign.duration')}
									value={filters.duration}
									onChange={e => handleChange('duration', e.target.value)}
									color={theme.primary}
								/>
							</>
						)}
					</div>

					<div className='mt-6 flex justify-end gap-2'>
						<Button variant='text' color='gray' onClick={() => setOpenFilters(false)}>
							{t('common.cancel')}
						</Button>
						<Button
							className='w-full md:w-auto'
							variant='gradient'
							color={theme.primary}
							onClick={() => {
								onSearch();
								setOpenFilters(false);
							}}
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
	onSearch: PropTypes.func.isRequired,
	theme: PropTypes.object.isRequired,
};
