import { useState } from 'react';
import { Input, Button, Typography, Select, Option, Alert } from '@material-tailwind/react';
import { EyeSlashIcon, EyeIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form'; // Importamos hook-form y Controller
import AuthLayout from '../../components/auth/AuthLayout';
import { TIMEZONES } from '../../data/timezones';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';

export function RegisterPage() {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	// Configuración de react-hook-form
	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm();

	// Estados solo para la UI (ojitos y errores de servidor)
	const [passwordShown, setPasswordShown] = useState(false);
	const [confirmShown, setConfirmShown] = useState(false);
	const [serverError, setServerError] = useState(null);

	// Watcher para comprobar que las contraseñas coinciden
	const password = watch('password');

	const onSubmit = async data => {
		setServerError(null);

		try {
			const signupRequest = {
				profilename: data.profileName,
				roleType: data.roleType.toUpperCase(),
				timeZone: data.timeZone,
				email: data.email,
				password: data.password,
			};

			await AuthService.register(signupRequest);
			navigate('/login', { state: { message: t('auth.successRegistration') } });
		} catch (error) {
			console.error('Error en registro:', error);
			const errorData = error.response?.data;
			const errorString = typeof errorData === 'string' ? errorData : errorData?.message || '';

			if (errorString.includes('Error: Correo  ya en uso')) {
				setServerError(t('auth.errorEmailInUse'));
			} else if (errorString.includes('Error: El nombre de perfil ya está en uso')) {
				setServerError(t('auth.errorProfileNameInUse'));
			} else {
				setServerError(t('auth.errorConnection'));
			}
		}
	};

	// Desestructuramos las referencias de los Inputs normales
	const { ref: profileRef, ...profileRest } = register('profileName', {
		required: t('errors.required'),
	});
	const { ref: emailRef, ...emailRest } = register('email', {
		required: t('errors.required'),
		pattern: {
			value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
			message: t('auth.invalidEmail'),
		},
	});

	const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]+$/;
	const { ref: passwordRef, ...passwordRest } = register('password', {
		required: t('errors.required'),
		minLength: {
			value: 8,
			message: t('errors.passwordLength'),
		},
		pattern: {
			value: complexityRegex,
			message: t('errors.passwordComplexity', ''),
		},
	});
	const { ref: confirmRef, ...confirmRest } = register('confirmPassword', {
		required: t('errors.required', 'Debes confirmar tu contraseña'),
		validate: value => value === password || t('errors.passwordMatch'),
	});

	return (
		<AuthLayout>
			<form
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				className='mx-auto max-w-[24rem] lg:max-w-4xl w-full text-left grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl'
			>
				<div className='lg:col-span-2 text-center mb-2'>
					<Typography variant='h3' color='blue-gray'>
						{t('auth.signUp')}
					</Typography>
				</div>

				{/* ERROR DEL BACKEND */}
				{serverError && (
					<div className='lg:col-span-2'>
						<Alert color='red' icon={<InformationCircleIcon strokeWidth={2} className='h-6 w-6' />}>
							{serverError}
						</Alert>
					</div>
				)}

				{/* Nombre de Perfil */}
				<div>
					<Input
						label={t('profile.profileName')}
						size='lg'
						placeholder='MasterDungeon'
						className='bg-white'
						autoComplete='off'
						inputRef={profileRef}
						{...profileRest}
						error={!!errors.profileName}
					/>
					{errors.profileName && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{errors.profileName.message}
						</Typography>
					)}
				</div>

				{/* Tipo de Perfil Inicial (Usando Controller de React-Hook-Form) */}
				<div>
					<Controller
						name='roleType'
						control={control}
						rules={{ required: t('errors.required', 'Selecciona un tipo de perfil') }}
						render={({ field }) => (
							<Select
								label={t('profile.roleType')}
								size='lg'
								className='bg-white'
								value={field.value}
								onChange={val => field.onChange(val)}
								error={!!errors.roleType}
							>
								<Option value='WRITTEN'>{t('profile.narrative')}</Option>
								<Option value='TABLETOP'>{t('profile.table')}</Option>
							</Select>
						)}
					/>
					{errors.roleType && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{errors.roleType.message}
						</Typography>
					)}
					<Typography variant='paragraph' className='mt-1 text-[12px] text-gray-500 italic'>
						* {t('auth.roleTypeNote')}
					</Typography>
				</div>

				{/* Zona Horaria (Usando Controller) */}
				<div>
					<Controller
						name='timeZone'
						control={control}
						rules={{ required: t('errors.required', 'Selecciona tu zona horaria') }}
						render={({ field }) => (
							<Select
								label={t('account.timeZone')}
								size='lg'
								className='bg-white'
								value={field.value}
								onChange={val => field.onChange(val)}
								error={!!errors.timeZone}
							>
								{TIMEZONES.map(({ value, label }) => (
									<Option key={value} value={value}>
										{label}
									</Option>
								))}
							</Select>
						)}
					/>
					{errors.timeZone && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{errors.timeZone.message}
						</Typography>
					)}
				</div>

				{/* Email */}
				<div className='lg:col-span-2'>
					<Input
						label={t('account.email')}
						size='lg'
						type='email'
						placeholder='name@mail.com'
						autoComplete='nope'
						className='bg-white'
						inputRef={emailRef}
						{...emailRest}
						error={!!errors.email}
					/>
					{errors.email && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{errors.email.message}
						</Typography>
					)}
				</div>

				{/* Password */}
				<div>
					<Input
						label={t('account.password')}
						size='lg'
						placeholder='********'
						type={passwordShown ? 'text' : 'password'}
						autoComplete='new-password'
						className='bg-white'
						inputRef={passwordRef}
						{...passwordRest}
						error={!!errors.password}
						icon={
							<button type='button' onClick={() => setPasswordShown(!passwordShown)} className='focus:outline-none'>
								{passwordShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}
							</button>
						}
					/>
					{errors.password && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{errors.password.message}
						</Typography>
					)}
				</div>

				{/* Confirm Password */}
				<div>
					<Input
						label={t('account.confirmPassword')}
						size='lg'
						placeholder='********'
						type={confirmShown ? 'text' : 'password'}
						autoComplete='new-password'
						className='bg-white'
						inputRef={confirmRef}
						{...confirmRest}
						error={!!errors.confirmPassword}
						icon={
							<button type='button' onClick={() => setConfirmShown(!confirmShown)} className='focus:outline-none'>
								{confirmShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}
							</button>
						}
					/>
					{errors.confirmPassword && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{errors.confirmPassword.message}
						</Typography>
					)}
				</div>

				<div className='lg:col-span-2 flex flex-col items-center mt-2'>
					<Button
						type='submit'
						color='red'
						size='lg'
						className='mt-1 flex justify-center items-center gap-2'
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creando cuenta...' : t('auth.signUp')}
					</Button>

					<Typography variant='small' color='gray' className='!mt-4 text-center font-normal'>
						{t('auth.alreadyRegistered')}{' '}
						<a href='/login' className='font-medium text-gray-900 transition-colors hover:text-blue-500'>
							{t('auth.login')}
						</a>
					</Typography>
				</div>
			</form>
		</AuthLayout>
	);
}

export default RegisterPage;
