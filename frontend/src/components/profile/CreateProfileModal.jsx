import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import {
	Button,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Input,
	Textarea,
	Typography,
	Avatar,
	Chip,
} from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';

export function CreateProfileModal({ open, handler, type, onCreate, theme }) {
	const { t } = useTranslation('global');

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			profileName: '',
			description: '',
			image: '',
		},
	});

	const watchImage = watch('image');

	const onSubmit = async data => {
		try {
			// Enviamos los datos + el tipo de perfil (TABLETOP/WRITTEN)
			await onCreate(data);
			reset();
			handler(); // Cerramos al terminar
		} catch (e) {
			if (e.response?.status === 403) {
				setError('profileName', {
					type: 'manual',
					message: t('profile.create.errorAlreadyExists'),
				});
			}
		}
	};

	return (
		<Dialog open={open} handler={handler} size='md'>
			<form id='create-profile-form' onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader className='flex justify-between items-center'>
					{t('profile.create.title')}
					<Chip value={type} variant='gradient' color={type === 'TABLETOP' ? 'blue' : 'purple'} className='rounded-full' />
				</DialogHeader>

				<DialogBody divider className='flex flex-col gap-4'>
					<Typography variant='small' color='gray' className='font-normal italic'>
						{t(`profile.create.description_${type}`)}
					</Typography>

					<div className='flex flex-col items-center gap-2 mb-2'>
						<Avatar
							src={watchImage || '/default-avatar.png'}
							alt='preview'
							size='xl'
							variant='circular'
							className={`border-2 p-1 ${type === 'TABLETOP' ? 'border-blue-500' : 'border-purple-500'}`}
						/>
					</div>

					<div className='grid gap-5'>
						<div>
							<Input
								label={t('profile.create.profileName')}
								{...register('profileName', {
									required: t('profile.create.nameRequired'),
									minLength: { value: 3, message: t('profile.create.nameTooShort') },
								})}
								error={!!errors.profileName}
							/>
							{errors.profileName && (
								<Typography variant='small' color='red' className='mt-1'>
									{errors.profileName.message}
								</Typography>
							)}
						</div>

						<div>
							<Input label={t('profile.create.image')} {...register('image')} />
						</div>

						<div>
							<Textarea
								label={t('profile.create.bio')}
								{...register('description', {
									maxLength: { value: 255, message: t('profile.edit.descriptionMaxLength') },
								})}
								error={!!errors.description}
							/>
							<div className='flex justify-end mt-1'>
								<Typography variant='small' color='gray' className='text-[10px]'>
									{watch('description')?.length || 0}/255
								</Typography>
							</div>
						</div>
					</div>
				</DialogBody>

				<DialogFooter className='space-x-2'>
					<Button variant='text' color='red' onClick={handler}>
						{t('common.cancel')}
					</Button>
					<Button form='create-profile-form' type='submit' loading={isSubmitting} variant='gradient' color={theme.primary}>
						{t('common.create')}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

CreateProfileModal.propTypes = {
	open: PropTypes.bool.isRequired,
	handler: PropTypes.func.isRequired,
	type: PropTypes.oneOf(['TABLETOP', 'WRITTEN']).isRequired,
	onCreate: PropTypes.func.isRequired,
	theme: PropTypes.object.isRequired,
};
