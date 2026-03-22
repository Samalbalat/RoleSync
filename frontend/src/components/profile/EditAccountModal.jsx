import React from 'react';
import PropTypes from 'prop-types';
import {
	Button,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Input,
	Typography,
	Select,
	Option,
} from '@material-tailwind/react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// Lista de zonas horarias recomendadas
const TIMEZONES = [
	'UTC',
	'Africa/Cairo',
	'America/Argentina/Buenos_Aires',
	'America/Bogota',
	'America/Mexico_City',
	'America/New_York',
	'Asia/Tokyo',
	'Europe/London',
	'Europe/Madrid',
	'Europe/Paris',
];

export function EditAccountModal({ open, handler, userData, onSave, theme }) {
	const { t } = useTranslation('global');
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			email: userData?.email || '',
			timeZone: userData?.timeZone || 'UTC',
			password: '',
		},
	});

	const onSubmit = async data => {
		await onSave(data);
	};

	return (
		<Dialog open={open} handler={handler} size='xs'>
			<DialogHeader>{t('profile.account.editTitle')}</DialogHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogBody className='space-y-4'>
					<div>
						<Input
							label={t('profile.email')}
							{...register('email', {
								required: true,
								pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							})}
							error={!!errors.email}
						/>
					</div>

					<div>
						<Controller
							name='timeZone'
							control={control}
							render={({ field }) => (
								<Select label={t('profile.timeZone')} {...field}>
									{TIMEZONES.map(tz => (
										<Option key={tz} value={tz}>
											{tz}
										</Option>
									))}
								</Select>
							)}
						/>
					</div>

					<div className='mt-6 border-t pt-4'>
						<Typography variant='small' color='blue-gray' className='mb-2 font-medium'>
							{t('profile.account.confirmPassword')}
						</Typography>
						<Input
							type='password'
							label={t('profile.password')}
							{...register('password', { required: true, minLength: 6 })}
							error={!!errors.password}
						/>
						<Typography variant='small' className='text-[10px] mt-1 text-gray-500'>
							{t('profile.account.passwordWarning')}
						</Typography>
					</div>
				</DialogBody>
				<DialogFooter className='space-x-2'>
					<Button variant='text' color='red' onClick={handler} disabled={isSubmitting}>
						{t('common.cancel')}
					</Button>
					<Button variant='gradient' color={theme.primary} type='submit' loading={isSubmitting}>
						{t('common.save')}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

EditAccountModal.propTypes = {
	open: PropTypes.bool.isRequired,
	handler: PropTypes.func.isRequired,
	userData: PropTypes.object,
	onSave: PropTypes.func.isRequired,
	theme: PropTypes.object.isRequired,
};
