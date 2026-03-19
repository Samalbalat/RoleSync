import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Typography,
	Input,
	Textarea,
	Button,
	Chip,
	IconButton,
} from '@material-tailwind/react';
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleLeftEllipsisIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';

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

const CreateGeneralPost = ({ open, handleClose }) => {
	const [tagsPreview, setTagsPreview] = useState([]);
	const [showImageInput, setShowImageInput] = useState(false);

	// Configuración de React Hook Form
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		setValue,
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

	// Actualizamos la previsualización de tags
	useEffect(() => {
		setTagsPreview(formatTags(currentTagsInput));
	}, [currentTagsInput]);

	const onSubmit = async data => {
		try {
			const finalData = {
				title: data.title,
				content: data.content,
				tags: formatTags(data.tagsInput),
				imageUrl: data.imageUrl, // <-- Incluimos la imagen
			};

			console.log('Enviando nuevo hilo a la API:', finalData);

			// Simulamos llamada a la API
			await new Promise(resolve => setTimeout(resolve, 1000));

			toast.success('¡Hilo creado con éxito!');

			reset(); // Limpia los campos
			setShowImageInput(false); // Oculta el input de imagen
			handleClose(); // Cierra el modal
		} catch (error) {
			console.error('Error creando el post:', error);
			toast.error('Hubo un problema al crear el hilo.');
		}
	};

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
						<ChatBubbleLeftEllipsisIcon className='w-6 h-6 text-indigo-600' />
					</div>
					<div>
						<Typography variant='h5' color='blue-gray'>
							Crear nuevo debate
						</Typography>
						<Typography variant='small' color='gray' className='font-normal'>
							Abre un nuevo hilo en el foro general para la comunidad.
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
							label='Título del debate'
							error={!!errors.title}
							color='indigo'
							{...register('title', {
								required: 'El título es obligatorio',
								minLength: { value: 5, message: 'El título debe tener al menos 5 caracteres' },
								maxLength: { value: 100, message: 'El título no puede exceder los 100 caracteres' },
							})}
						/>
						{getErrorMessage(errors.title)}
					</div>

					{/* ETIQUETAS (TAGS) */}
					<div>
						<Input
							size='lg'
							label='Etiquetas (separadas por comas)'
							placeholder='ej. dudas, reglas, off-topic'
							color='indigo'
							{...register('tagsInput')}
						/>

						{tagsPreview.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-3'>
								{tagsPreview.map((tag, index) => (
									<Chip
										key={index}
										value={`#${tag}`}
										variant='ghost'
										color='indigo'
										size='sm'
										className='rounded-full lowercase'
									/>
								))}
							</div>
						)}
					</div>

					{/* CONTENIDO (MARDKOWN) + BOTÓN IMAGEN */}
					<div>
						<div className='flex justify-between items-center mb-2'>
							<Typography variant='small' color='blue-gray' className='font-medium'>
								Contenido de tu publicación (Soporta Markdown)
							</Typography>
							{/* Botón para activar/desactivar input de imagen */}
							<Button
								size='sm'
								variant={showImageInput ? 'filled' : 'text'}
								color={showImageInput ? 'indigo' : 'blue-gray'}
								className='flex items-center gap-2 px-3 py-1.5 rounded-full lowercase'
								onClick={() => setShowImageInput(!showImageInput)}
							>
								<PhotoIcon className='w-4 h-4' />
								{showImageInput ? 'Ocultar Imagen' : 'Añadir Imagen'}
							</Button>
						</div>
						<Textarea
							size='lg'
							rows={6}
							placeholder='Escribe aquí el contenido de tu hilo...'
							error={!!errors.content}
							color='indigo'
							className='resize-y'
							{...register('content', {
								required: 'El contenido es obligatorio',
								minLength: { value: 10, message: 'Escribe un poco más, al menos 10 caracteres' },
							})}
						/>
						{getErrorMessage(errors.content)}
					</div>

					{/* SECCIÓN DE IMAGEN (OCULTABLE) */}
					{showImageInput && (
						<div className='p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in'>
							<div className='flex items-center gap-2 mb-3'>
								<Input
									type='url'
									label='Pega la URL de la imagen aquí...'
									color='indigo'
									className='bg-white'
									icon={<LinkIcon className='h-5 w-5 text-gray-500' />}
									{...register('imageUrl')}
								/>
								{/* Botón para limpiar solo la imagen */}
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
										// Manejo básico de error de carga
										onError={e => {
											e.target.style.display = 'none';
											toast.error('La URL de imagen no parece válida.');
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
						Cancelar
					</Button>
					<Button type='submit' color='indigo' className='flex items-center gap-2' loading={isSubmitting}>
						<PaperAirplaneIcon className='h-4 w-4' />
						{isSubmitting ? 'Publicando...' : 'Publicar hilo'}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

CreateGeneralPost.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
};

export default CreateGeneralPost;
