import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Typography,
	Input,
	Button,
	Chip,
	IconButton,
} from '@material-tailwind/react';
import {
	PaperAirplaneIcon,
	XMarkIcon,
	ChatBubbleLeftEllipsisIcon,
	PhotoIcon,
	LinkIcon,
	AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { getTheme } from '../../utils/themeUtils';
import ForumService from '../../services/ForumService';

const formatTags = tagsString => {
	if (!tagsString) return [];
	return tagsString
		.split(',')
		.map(tag => tag.trim().toLowerCase())
		.filter(tag => tag.length > 0);
};

const getErrorMessage = error => {
	if (!error) return null;
	return (
		<Typography variant='small' color='red' className='mt-1 flex items-center gap-1 font-normal'>
			<XMarkIcon className='w-4 h-4' /> {error.message}
		</Typography>
	);
};

const CreateGeneralPost = ({ open, handleClose, onSuccess }) => {
	const [tagsPreview, setTagsPreview] = useState([]);
	const [showImageInput, setShowImageInput] = useState(false);
	const [showFormatMenu, setShowFormatMenu] = useState(false);
	const textareaRef = useRef(null);

	const { t } = useTranslation('global');
	const theme = getTheme();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		setValue,
		getValues,
		reset,
	} = useForm({
		defaultValues: {
			title: '',
			tagsInput: '',
			content: '',
			imageUrl: '',
		},
	});

	const currentTagsInput = watch('tagsInput');
	const currentImageUrl = watch('imageUrl');

	useEffect(() => {
		setTagsPreview(formatTags(currentTagsInput));
	}, [currentTagsInput]);

	const insertFormatting = (prefix, suffix = '') => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = getValues('content') || '';
		const selected = text.substring(start, end);
		const insertedText = selected || 'texto';

		const newText = text.substring(0, start) + prefix + insertedText + suffix + text.substring(end);

		setValue('content', newText, { shouldValidate: true, shouldDirty: true });

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + prefix.length, start + prefix.length + insertedText.length);
		}, 0);
	};

	const onSubmit = async data => {
		try {
			const payload = {
				type: 'THREAD_START',
				title: data.title,
				content: data.content,
				tags: formatTags(data.tagsInput),
				mediaUrls: data.imageUrl ? [data.imageUrl] : [],
			};

			await ForumService.createGeneralThread(payload);

			toast.success(t('forum.general.create.success') || 'Hilo creado con éxito');

			reset();
			setShowImageInput(false);
			setShowFormatMenu(false);
			handleClose();

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error('Error creando el post:', error);
			toast.error(t('forum.general.create.error') || 'Error al crear el hilo');
		}
	};

	const { ref: contentRef, ...contentRest } = register('content', {
		required: t('forum.general.create.contentRequired'),
		minLength: { value: 10, message: t('forum.general.create.contentMinLength') },
	});

	return (
		<Dialog
			open={open}
			handler={handleClose}
			size='lg'
			className='bg-white'
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 },
			}}
		>
			<DialogHeader className='flex justify-between items-center border-b border-gray-100 bg-indigo-50 rounded-t-lg p-4'>
				<div className='flex items-center gap-3'>
					<div className='p-2 bg-indigo-100 rounded-lg'>
						<ChatBubbleLeftEllipsisIcon className={`w-6 h-6 ${theme.textPrimary}`} />
					</div>
					<div>
						<Typography variant='h5' color='blue-gray'>
							{t('forum.general.create.newThread')}
						</Typography>
						<Typography variant='small' color='gray' className='font-normal'>
							{t('forum.general.create.newThreadDesc')}
						</Typography>
					</div>
				</div>
				<IconButton variant='text' color='blue-gray' onClick={handleClose}>
					<XMarkIcon className='h-5 w-5 stroke-2' />
				</IconButton>
			</DialogHeader>

			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col max-h-[85vh]'>
				<DialogBody className='overflow-y-auto flex flex-col gap-6 p-6'>
					{/* TÍTULO */}
					<div>
						<Input
							size='lg'
							label={t('forum.general.create.title')}
							error={!!errors.title}
							color={theme.primary}
							{...register('title', {
								required: t('forum.general.create.titleRequired'),
								minLength: { value: 5, message: t('forum.general.create.titleMinLength') },
								maxLength: { value: 100, message: t('forum.general.create.titleMaxLength') },
							})}
						/>
						{getErrorMessage(errors.title)}
					</div>

					{/* ETIQUETAS (TAGS) */}
					<div>
						<Input
							size='lg'
							label={t('forum.general.create.tags')}
							placeholder={t('forum.general.create.tagsPlaceholder')}
							color={theme.primary}
							{...register('tagsInput')}
						/>

						{tagsPreview.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-3'>
								{tagsPreview.map((tag, index) => (
									<Chip
										key={index}
										value={`#${tag}`}
										variant='ghost'
										color={theme.primary}
										size='sm'
										className='rounded-full lowercase'
									/>
								))}
							</div>
						)}
					</div>

					{/* CONTENIDO + BARRA DE HERRAMIENTAS */}
					<div>
						<div className='flex justify-between items-center mb-2'>
							<Typography variant='small' color='blue-gray' className='font-medium'>
								{t('forum.general.create.content')}
							</Typography>

							<div className='flex gap-2'>
								<Button
									size='sm'
									variant={showFormatMenu ? 'filled' : 'text'}
									color={showFormatMenu ? 'indigo' : 'blue-gray'}
									className='flex items-center gap-2 px-3 py-1.5 rounded-full lowercase'
									onClick={() => setShowFormatMenu(!showFormatMenu)}
								>
									<AdjustmentsHorizontalIcon className='w-4 h-4' />
									Formato
								</Button>
								<Button
									size='sm'
									variant={showImageInput ? 'filled' : 'text'}
									color={showImageInput ? 'indigo' : 'blue-gray'}
									className='flex items-center gap-2 px-3 py-1.5 rounded-full lowercase'
									onClick={() => setShowImageInput(!showImageInput)}
								>
									<PhotoIcon className='w-4 h-4' />
									{showImageInput ? t('forum.general.create.hideImage') : t('forum.general.create.addImage')}
								</Button>
							</div>
						</div>

						{/* BARRA DE FORMATO MARKDOWN */}
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
									{t('forum.quote') || 'Citar'}
								</Button>
							</div>
						)}

						{/* TEXTAREA NATIVO INTEGRADO CON REACT-HOOK-FORM */}
						<div className='relative'>
							<textarea
								{...contentRest}
								ref={e => {
									contentRef(e); // Asigna la ref para react-hook-form
									textareaRef.current = e; // Asigna nuestra ref local para manejar selecciones
								}}
								rows={6}
								className={`w-full min-h-[120px] p-3 rounded-lg border ${errors.content ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-y bg-gray-50 text-gray-900`}
								placeholder={t('forum.general.create.contentPlaceholder')}
							/>
						</div>
						{getErrorMessage(errors.content)}
					</div>

					{/* SECCIÓN DE IMAGEN (OCULTABLE) */}
					{showImageInput && (
						<div className='p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in'>
							<div className='flex items-center gap-2 mb-3'>
								<Input
									type='url'
									label={t('forum.general.create.imageUrl')}
									color={theme.primary}
									className='bg-white'
									icon={<LinkIcon className='h-5 w-5 text-gray-500' />}
									{...register('imageUrl')}
								/>
								{currentImageUrl && (
									<IconButton variant='text' color='red' onClick={() => setValue('imageUrl', '')}>
										<XMarkIcon className='h-5 w-5' />
									</IconButton>
								)}
							</div>

							{/* PREVISUALIZACIÓN DE LA IMAGEN */}
							{currentImageUrl && (
								<div className='mt-3 relative inline-block'>
									<img
										src={currentImageUrl}
										alt='Preview'
										className='h-28 object-cover rounded-lg border border-gray-200 shadow-sm'
										onError={e => {
											e.target.style.display = 'none';
											toast.error(t('forum.general.create.invalidImageUrl') || 'URL de imagen no válida');
										}}
										onLoad={e => (e.target.style.display = 'block')}
									/>
									<button
										type='button'
										className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors'
										onClick={() => setValue('imageUrl', '')}
									>
										<XMarkIcon className='h-3 w-3' />
									</button>
								</div>
							)}
						</div>
					)}
				</DialogBody>

				<DialogFooter className='p-4 border-t border-gray-100 flex justify-between'>
					<Button variant='text' color='blue-gray' onClick={handleClose} disabled={isSubmitting}>
						{t('common.cancel')}
					</Button>
					<Button type='submit' color='indigo' className='flex items-center gap-2' loading={isSubmitting}>
						<PaperAirplaneIcon className='h-4 w-4' />
						{isSubmitting ? t('forum.general.create.submitting') : t('forum.general.create.submit')}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

CreateGeneralPost.propTypes = {
	open: PropTypes.bool,
	handleClose: PropTypes.func,
	onSuccess: PropTypes.func,
};

export default CreateGeneralPost;
