import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
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

const PostEditor = ({ campaignId, myCharacter, otherCharacters = [], isOwner, isTabletop = false }) => {
	const [content, setContent] = useState('');
	const [isOoc, setIsOoc] = useState(false);
	const [visibleToIds, setVisibleToIds] = useState([]);
	const isDm = isOwner;
	const [showFormatMenu, setShowFormatMenu] = useState(false);
	const [showImageInput, setShowImageInput] = useState(false);
	const [imageUrl, setImageUrl] = useState('');

	const textareaRef = useRef(null);

	const toggleVisibility = characterId => {
		setVisibleToIds(prev => (prev.includes(characterId) ? prev.filter(id => id !== characterId) : [...prev, characterId]));
	};

	const insertFormatting = (prefix, suffix = '') => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = content;

		const before = text.substring(0, start);
		const selected = text.substring(start, end);
		const after = text.substring(end);

		const insertedText = selected || 'texto';
		const newText = before + prefix + insertedText + suffix + after;

		setContent(newText);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + prefix.length, start + prefix.length + insertedText.length);
		}, 0);
	};

	const handleSubmit = () => {
		if (!content.trim() && !imageUrl.trim()) return;

		console.log('Enviando post:', {
			campaignId,
			content,
			imageUrl,
			isOoc: isTabletop ? false : isOoc, // Forzamos a false si es foro
			isDm,
			authorCharacterId: myCharacter?.id || null,
			visibleToCharacterIds: isTabletop ? [] : visibleToIds, // Forzamos a vacío si es foro
		});

		// Limpiar el editor tras enviar
		setContent('');
		setImageUrl('');
		setShowImageInput(false);
		setShowFormatMenu(false);
		setIsOoc(false);
		setVisibleToIds([]);
	};

	const isSecret = !isTabletop && visibleToIds.length > 0;

	const buttonColor = useMemo(() => {
		if (isDm) return 'blue';
		if (isOoc && !isTabletop) return 'gray';
		if (isSecret) return 'purple';
		return 'indigo';
	}, [isOoc, isSecret, isDm, isTabletop]);

	const textareaStyles = useMemo(() => {
		if (isDm) {
			return 'bg-blue-50 border-blue-300 focus:border-blue-500 focus:ring-blue-200 text-blue-900 border-l-4 border-l-blue-600';
		}
		if (isOoc && !isTabletop) {
			return 'bg-gray-50 border-gray-300 focus:border-gray-500 focus:ring-gray-200 text-gray-700 italic';
		}
		if (isSecret) {
			return 'bg-purple-50 border-purple-200 focus:border-purple-500 focus:ring-purple-100 text-gray-900';
		}
		return 'bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900';
	}, [isOoc, isSecret, isDm, isTabletop]);

	const textareaPlaceholder = useMemo(() => {
		if (isTabletop) {
			return isDm ? 'Escribe un aviso para el foro de la mesa...' : 'Escribe tu mensaje en el foro...';
		}
		if (isDm) {
			return 'Escribe un aviso oficial para la partida...';
		}
		if (isOoc) {
			return 'Escribe un mensaje fuera de rol para el grupo...';
		}
		if (isSecret) {
			return 'Escribe tu susurro secreto...';
		}
		return 'Describe tu acción, palabras o pensamientos...';
	}, [isOoc, isSecret, isDm, isTabletop]);

	return (
		<div
			className={`mb-6 p-4 rounded-xl border shadow-sm transition-colors duration-200 ${
				isDm
					? 'bg-blue-50/50 border-blue-200'
					: isOoc && !isTabletop
						? 'bg-gray-100 border-gray-300'
						: 'bg-white border-gray-200'
			}`}
		>
			{/* CABECERA DEL EDITOR: Info del personaje y Switch OOC */}
			<div className='flex justify-between items-center mb-3'>
				<div className='flex items-center gap-3'>
					<Avatar
						src={myCharacter?.avatar || 'https://ui-avatars.com/api/?name=DM&background=E0E7FF&color=3730A3'}
						alt='Avatar'
						size='sm'
						className='border border-gray-300 shadow-sm'
					/>
					<div className='flex flex-col'>
						<Typography variant='small' className='font-bold text-gray-800'>
							{myCharacter ? myCharacter.name : 'Dungeon Master'}
						</Typography>

						{/* Indicador visual de visibilidad (oculto en foro porque todo es público) */}
						{!isTabletop &&
							(isSecret ? (
								<Typography variant='small' className='text-purple-600 text-[10px] font-bold uppercase tracking-wider'>
									Susurro ({visibleToIds.length})
								</Typography>
							) : (
								<Typography variant='small' className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>
									Público
								</Typography>
							))}
					</div>
				</div>

				{/* Switch OOC (oculto en el foro) */}
				{!isTabletop && (
					<div className='flex items-center gap-2'>
						<Typography variant='small' className={`text-xs font-bold ${isOoc ? 'text-gray-700' : 'text-gray-400'}`}>
							MODO OOC
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
						Cita
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

			{/* INPUT DE IMAGEN */}
			{showImageInput && (
				<div className='flex items-center gap-2 mb-3 animate-fade-in'>
					<Input
						type='url'
						label='Pega la URL de la imagen aquí...'
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

			{/* VISTA PREVIA DE LA IMAGEN */}
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
						title='Añadir Imagen'
						onClick={() => setShowImageInput(!showImageInput)}
					>
						<PhotoIcon className='h-5 w-5' />
					</IconButton>
					<IconButton
						variant={showFormatMenu ? 'filled' : 'text'}
						color={showFormatMenu ? 'indigo' : 'blue-gray'}
						className='rounded-full transition-colors'
						title='Formato'
						onClick={() => setShowFormatMenu(!showFormatMenu)}
					>
						<AdjustmentsHorizontalIcon className='h-5 w-5' />
					</IconButton>

					{/* MENÚ DE SUSURROS (Oculto en el foro) */}
					{!isTabletop && (
						<Menu dismiss={{ itemPress: false }}>
							<MenuHandler>
								<IconButton
									variant={isSecret ? 'filled' : 'text'}
									color={isSecret ? 'purple' : 'blue-gray'}
									className='rounded-full transition-colors'
									title='Mensaje Secreto (Susurro)'
								>
									<EyeSlashIcon className='h-5 w-5' />
								</IconButton>
							</MenuHandler>
							<MenuList className='max-h-72'>
								<Typography variant='small' color='blue-gray' className='mb-2 font-bold px-3'>
									¿Quién puede ver esto?
								</Typography>
								{otherCharacters.length === 0 ? (
									<MenuItem disabled>No hay más personajes</MenuItem>
								) : (
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
								)}
								{isSecret && (
									<div className='p-2 border-t mt-2'>
										<Button size='sm' color='red' variant='text' fullWidth onClick={() => setVisibleToIds([])}>
											Hacer Público
										</Button>
									</div>
								)}
							</MenuList>
						</Menu>
					)}
				</div>

				{/* Botón de Enviar */}
				<Button
					size='md'
					color={buttonColor}
					className='flex items-center gap-2 px-6'
					onClick={handleSubmit}
					disabled={!content.trim() && !imageUrl.trim()}
				>
					<PaperAirplaneIcon className='h-4 w-4' />
					Enviar
				</Button>
			</div>
		</div>
	);
};

PostEditor.propTypes = {
	campaignId: PropTypes.string.isRequired,
	currentUser: PropTypes.object,
	myCharacter: PropTypes.object,
	otherCharacters: PropTypes.array,
	isOwner: PropTypes.bool,
	isTabletop: PropTypes.bool,
};

export default PostEditor;
