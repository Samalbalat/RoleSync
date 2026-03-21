import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Switch,
	Avatar,
	Typography,
	IconButton,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Checkbox,
	Input,
} from '@material-tailwind/react';
import {
	PaperAirplaneIcon,
	PhotoIcon,
	AdjustmentsHorizontalIcon,
	EyeSlashIcon,
	XMarkIcon,
	LinkIcon,
} from '@heroicons/react/24/outline';

// HELPERS EXTERNOS

const getAuthorDisplayData = (isGeneralForum, user, character) => {
	if (isGeneralForum) {
		return {
			name: user?.profileName || 'Usuario',
			avatar: user?.profileImage || `https://ui-avatars.com/api/?name=${user?.profileName || 'User'}&background=f3f4f6`,
			id: user?.id,
		};
	}
	return {
		name: character?.name || 'Master',
		avatar: character?.avatar || 'https://ui-avatars.com/api/?name=DM&background=E0E7FF&color=3730A3',
		id: character?.id || null,
	};
};

const getButtonColor = (isDm, isOoc, isSecret) => {
	if (isDm) return 'blue';
	if (isOoc) return 'gray';
	if (isSecret) return 'purple';
	return 'indigo';
};

const getTextareaStyles = (isDm, isOoc, isSecret) => {
	if (isDm)
		return 'bg-blue-50 border-blue-300 focus:border-blue-500 focus:ring-blue-200 text-blue-900 border-l-4 border-l-blue-600';
	if (isOoc) return 'bg-gray-50 border-gray-300 focus:border-gray-500 focus:ring-gray-200 text-gray-700 italic';
	if (isSecret) return 'bg-purple-50 border-purple-200 focus:border-purple-500 focus:ring-purple-100 text-gray-900';
	return 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900';
};

const getContainerStyles = (isDm, isOoc) => {
	if (isDm) return 'bg-blue-50/50 border-blue-200';
	if (isOoc) return 'bg-gray-100 border-gray-300';
	return 'bg-white border-gray-200';
};

const getPlaceholder = (isGeneralForum, isTabletop, isDm, isOoc, isSecret, t) => {
	if (isGeneralForum) return t('forum.postEditor.generalPlaceholder');
	if (isTabletop)
		return isDm ? t('forum.postEditor.tabletopDmPlaceholder') : t('forum.postEditor.tabletopPlayerPlaceholder');
	if (isDm) return t('forum.postEditor.dmPlaceholder');
	if (isOoc) return t('forum.postEditor.oocPlaceholder');
	if (isSecret) return t('forum.postEditor.secretPlaceholder');
	return t('forum.postEditor.defaultPlaceholder');
};

// COMPONENTE PRINCIPAL

const PostEditor = ({
	campaignId,
	currentUser,
	myCharacter,
	otherCharacters = [],
	isOwner,
	isTabletop = false,
	isGeneralForum = false,
}) => {
	const [content, setContent] = useState('');
	const [isOoc, setIsOoc] = useState(false);
	const [visibleToIds, setVisibleToIds] = useState([]);
	const [showFormatMenu, setShowFormatMenu] = useState(false);
	const [showImageInput, setShowImageInput] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const { t } = useTranslation();

	const textareaRef = useRef(null);

	// Variables de estado lógicas
	const effectiveIsDm = !isGeneralForum && isOwner;
	const canUseRoleplayFeatures = !isTabletop && !isGeneralForum;
	const isSecret = canUseRoleplayFeatures && visibleToIds.length > 0;
	const effectiveIsOoc = canUseRoleplayFeatures && isOoc;
	const isSubmitDisabled = !content.trim() && !imageUrl.trim();
	const hasOtherCharacters = otherCharacters.length > 0;

	// Uso de los helpers externos
	const {
		name: displayName,
		avatar: displayAvatar,
		id: authorId,
	} = getAuthorDisplayData(isGeneralForum, currentUser, myCharacter);
	const containerClasses = getContainerStyles(effectiveIsDm, effectiveIsOoc);
	const textareaStyles = getTextareaStyles(effectiveIsDm, effectiveIsOoc, isSecret);
	const buttonColor = getButtonColor(effectiveIsDm, effectiveIsOoc, isSecret);
	const textareaPlaceholder = getPlaceholder(isGeneralForum, isTabletop, effectiveIsDm, effectiveIsOoc, isSecret, t);

	const toggleVisibility = characterId => {
		setVisibleToIds(prev => (prev.includes(characterId) ? prev.filter(id => id !== characterId) : [...prev, characterId]));
	};

	const insertFormatting = (prefix, suffix = '') => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = content;
		const selected = text.substring(start, end);
		const insertedText = selected || 'texto';

		setContent(text.substring(0, start) + prefix + insertedText + suffix + text.substring(end));

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + prefix.length, start + prefix.length + insertedText.length);
		}, 0);
	};

	const handleSubmit = () => {
		if (isSubmitDisabled) return;

		console.log('Enviando post:', {
			campaignId: isGeneralForum ? null : campaignId,
			content,
			imageUrl,
			isOoc: effectiveIsOoc,
			isDm: effectiveIsDm,
			authorId,
			visibleToCharacterIds: canUseRoleplayFeatures ? visibleToIds : [],
		});

		setContent('');
		setImageUrl('');
		setShowImageInput(false);
		setShowFormatMenu(false);
		setIsOoc(false);
		setVisibleToIds([]);
	};

	return (
		<div className={`mb-6 p-4 rounded-xl border shadow-sm transition-colors duration-200 ${containerClasses}`}>
			{/* CABECERA DEL EDITOR */}
			<div className='flex justify-between items-center mb-3'>
				<div className='flex items-center gap-3'>
					<Avatar src={displayAvatar} alt='Avatar' size='sm' className='border border-gray-300 shadow-sm' />
					<div className='flex flex-col'>
						<Typography variant='small' className='font-bold text-gray-800'>
							{displayName}
						</Typography>

						{canUseRoleplayFeatures && (
							<Typography
								variant='small'
								className={`text-[10px] font-bold uppercase tracking-wider ${isSecret ? 'text-purple-600' : 'text-gray-500'}`}
							>
								{isSecret ? `${t('forum.whisper')}` : `${t('forum.public')}`}
							</Typography>
						)}
					</div>
				</div>

				{canUseRoleplayFeatures && (
					<div className='flex items-center gap-2'>
						<Typography variant='small' className={`text-xs font-bold ${isOoc ? 'text-gray-700' : 'text-gray-400'}`}>
							{t('forum.occMode')}
						</Typography>
						<Switch
							id='ooc-switch'
							color='gray'
							checked={isOoc}
							onChange={e => setIsOoc(e.target.checked)}
							className='h-full w-full checked:bg-gray-700'
							containerProps={{ className: 'w-9 h-5' }}
							circleProps={{ className: 'before:hidden left-0.5 border-none w-4 h-4' }}
						/>
					</div>
				)}
			</div>

			{/* BARRA DE FORMATO */}
			{showFormatMenu && (
				<div className='flex gap-2 mb-2 p-1 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in'>
					<Button
						size='sm'
						variant='text'
						color='blue-gray'
						className='px-3 py-1 font-bold'
						onClick={() => insertFormatting('**', '**')}
					>
						B
					</Button>
					<Button
						size='sm'
						variant='text'
						color='blue-gray'
						className='px-3 py-1 italic font-serif'
						onClick={() => insertFormatting('*', '*')}
					>
						I
					</Button>
					<Button
						size='sm'
						variant='text'
						color='blue-gray'
						className='px-3 py-1 line-through'
						onClick={() => insertFormatting('~~', '~~')}
					>
						S
					</Button>
					<div className='w-px bg-gray-300 mx-1'></div>
					<Button
						size='sm'
						variant='text'
						color='blue-gray'
						className='px-3 py-1 flex items-center gap-1'
						onClick={() => insertFormatting('> ')}
					>
						{t('forum.quote')}
					</Button>
				</div>
			)}

			{/* ÁREA DE TEXTO */}
			<div className='relative'>
				<textarea
					ref={textareaRef}
					className={`w-full min-h-[120px] p-3 rounded-lg border focus:ring-2 outline-none transition-all resize-y ${textareaStyles}`}
					placeholder={textareaPlaceholder}
					value={content}
					onChange={e => setContent(e.target.value)}
				></textarea>
			</div>

			{/* INPUT Y VISTA PREVIA DE IMAGEN */}
			{showImageInput && (
				<div className='flex items-center gap-2 mb-3 animate-fade-in mt-3'>
					<Input
						type='url'
						label={t('forum.postEditor.imagePlaceholder')}
						value={imageUrl}
						onChange={e => setImageUrl(e.target.value)}
						className='bg-white'
						icon={<LinkIcon className='h-5 w-5 text-gray-500' />}
					/>
					<IconButton
						variant='text'
						color='red'
						onClick={() => {
							setShowImageInput(false);
							setImageUrl('');
						}}
					>
						<XMarkIcon className='h-5 w-5' />
					</IconButton>
				</div>
			)}

			{imageUrl && (
				<div className='mt-3 relative inline-block'>
					<img
						src={imageUrl}
						alt='Preview'
						className='h-24 object-cover rounded-lg border border-gray-200 shadow-sm'
						onError={e => (e.target.style.display = 'none')}
						onLoad={e => (e.target.style.display = 'block')}
					/>
					<button
						className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors'
						onClick={() => setImageUrl('')}
					>
						<XMarkIcon className='h-3 w-3' />
					</button>
				</div>
			)}

			{/* BARRA DE HERRAMIENTAS INFERIOR */}
			<div className='flex justify-between items-center mt-3 pt-3 border-t border-gray-100'>
				<div className='flex gap-1 items-center'>
					<IconButton
						variant={showImageInput ? 'filled' : 'text'}
						color={showImageInput ? 'indigo' : 'blue-gray'}
						className='rounded-full transition-colors'
						title={t('forum.postEditor.addImage')}
						onClick={() => setShowImageInput(!showImageInput)}
					>
						<PhotoIcon className='h-5 w-5' />
					</IconButton>
					<IconButton
						variant={showFormatMenu ? 'filled' : 'text'}
						color={showFormatMenu ? 'indigo' : 'blue-gray'}
						className='rounded-full transition-colors'
						title={t('forum.postEditor.format')}
						onClick={() => setShowFormatMenu(!showFormatMenu)}
					>
						<AdjustmentsHorizontalIcon className='h-5 w-5' />
					</IconButton>

					{/* MENÚ DE SUSURROS */}
					{canUseRoleplayFeatures && (
						<Menu dismiss={{ itemPress: false }}>
							<MenuHandler>
								<IconButton
									variant={isSecret ? 'filled' : 'text'}
									color={isSecret ? 'purple' : 'blue-gray'}
									className='rounded-full transition-colors'
									title={t('forum.whisper')}
								>
									<EyeSlashIcon className='h-5 w-5' />
								</IconButton>
							</MenuHandler>
							<MenuList className='max-h-72'>
								<Typography variant='small' color='blue-gray' className='mb-2 font-bold px-3'>
									{t('forum.postEditor.whoCanSee')}
								</Typography>
								{hasOtherCharacters ? (
									otherCharacters.map(char => (
										<MenuItem key={char.id} className='p-0'>
											<label className='flex w-full cursor-pointer items-center px-3 py-2'>
												<Checkbox
													ripple={false}
													className='hover:before:opacity-0'
													containerProps={{ className: 'p-0 mr-3' }}
													checked={visibleToIds.includes(char.id)}
													onChange={() => toggleVisibility(char.id)}
												/>
												<Typography color='blue-gray' className='font-medium'>
													{char.name}
												</Typography>
											</label>
										</MenuItem>
									))
								) : (
									<MenuItem disabled>{t('forum.postEditor.noMoreCharacters')}</MenuItem>
								)}
								{isSecret && (
									<div className='p-2 border-t mt-2'>
										<Button size='sm' color='red' variant='text' fullWidth onClick={() => setVisibleToIds([])}>
											{t('forum.public')}
										</Button>
									</div>
								)}
							</MenuList>
						</Menu>
					)}
				</div>

				<Button
					size='md'
					color={buttonColor}
					className='flex items-center gap-2 px-6'
					onClick={handleSubmit}
					disabled={isSubmitDisabled}
				>
					<PaperAirplaneIcon className='h-4 w-4' />
					{t('common.send')}
				</Button>
			</div>
		</div>
	);
};

PostEditor.propTypes = {
	campaignId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	currentUser: PropTypes.object,
	myCharacter: PropTypes.object,
	otherCharacters: PropTypes.array,
	isOwner: PropTypes.bool,
	isTabletop: PropTypes.bool,
	isGeneralForum: PropTypes.bool,
};

export default PostEditor;
