import { React, useEffect } from 'react';
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
} from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';

export function EditProfileModal({ open, handler, profileData, onSave, theme }) {
	const { t } = useTranslation('global');
	const {
		register,
		handleSubmit,
		watch,
		reset,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			profileName: '',
			description: '',
			image: '',
		},
	});

	useEffect(() => {
		if (open && profileData) {
			reset({
				profileName: profileData.profileName || '',
				description: profileData.description || '',
				image: profileData.image || '',
			});
			clearErrors();
		}
	}, [open, profileData, reset, clearErrors]);

	const watchImage = watch('image');

	const onSubmit = async data => {
		try {
			await onSave(data);
			reset();
			clearErrors();
		} catch (e) {
			if (e.response && e.response.status === 409) {
				setError('profileName', {
					type: 'manual',
					message: t('profile.edit.errorAlreadyExists'),
				});
			} else {
				console.error('Error genérico en submit', e);
			}
		}
	};

	return (
		<Dialog open={open} handler={handler} size='md'>
			<form id='edit-profile-form' onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader>{t('profile.edit.title')}</DialogHeader>

				<DialogBody divider className='flex flex-col gap-4'>
					<div className='flex flex-col items-center gap-2 mb-4'>
						<Typography variant='small' color='blue-gray' className='font-bold'>
							{t('profile.edit.avatarPreview')}
						</Typography>
						<Avatar
							src={watchImage || '/default-avatar.png'}
							alt='preview'
							size='xl'
							variant='circular'
							className='border-2 border-blue-500 p-1'
						/>
					</div>

					<div className='grid gap-6'>
						{/* Nombre del Perfil */}
						<div>
							<Input
								label={t('profile.edit.profileName')}
								{...register('profileName', { required: t('profile.edit.profileNameRequired') })}
								error={!!errors.profileName}
							/>
							{errors.profileName && (
								<Typography variant='small' color='red' className='mt-1'>
									{errors.profileName.message}
								</Typography>
							)}
						</div>

						{/* URL Imagen */}
						<div>
							<Input label={t('profile.edit.image')} {...register('image')} error={!!errors.image} />
							{errors.image && (
								<Typography variant='small' color='red' className='mt-1 text-[10px]'>
									{errors.image.message}
								</Typography>
							)}
						</div>

						{/* Descripción con contador de caracteres */}
						<div>
							<Textarea
								label={t('profile.edit.description')}
								{...register('description', {
									maxLength: { value: 255, message: t('profile.edit.descriptionMaxLength') },
								})}
								error={!!errors.description}
							/>
							<div className='flex justify-between mt-1'>
								{errors.description ? (
									<Typography variant='small' color='red'>
										{errors.description.message}
									</Typography>
								) : (
									<span />
								)}
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
					<Button form='edit-profile-form' type='submit' loading={isSubmitting} variant='gradient' color={theme.primary}>
						{t('common.save')}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

EditProfileModal.propTypes = {
	open: PropTypes.bool,
	handler: PropTypes.func.isRequired,
	profileData: PropTypes.shape({
		profileName: PropTypes.string,
		description: PropTypes.string,
		image: PropTypes.string,
	}),
	onSave: PropTypes.func.isRequired,
	theme: PropTypes.shape({
		primary: PropTypes.string,
	}).isRequired,
};
