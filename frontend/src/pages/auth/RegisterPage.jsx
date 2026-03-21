import { useState } from 'react';
import { Input, Button, Typography, Select, Option, Alert } from '@material-tailwind/react';
import { EyeSlashIcon, EyeIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/auth/AuthLayout';
import { TIMEZONES } from '../../data/timezones';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';

export function RegisterPage() {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		profileName: '',
		profileType: '',
		timeZone: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	// Esto es para el ojito de la contraseña
	const [passwordShown, setPasswordShown] = useState(false);
	const [confirmShown, setConfirmShown] = useState(false);

	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState(null);
	const [errors, setErrors] = useState({});

	const handleChange = (key, value) => {
		setFormData({ ...formData, [key]: value });
		if (errors[key]) setErrors({ ...errors, [key]: null });
		if (serverError) setServerError(null);
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setServerError(null);

		//Validaciones frontend
		const newErrors = {};
		newErrors.profileName = validateRequired(formData.profileName);
		newErrors.profileType = validateRequired(formData.profileType);
		newErrors.timeZone = validateRequired(formData.timeZone);
		newErrors.email = validateEmail(formData.email);
		newErrors.password = validatePassword(formData.password);

		if (formData.confirmPassword !== formData.password) {
			newErrors.confirmPassword = 'errors.passwordMatch';
		}

		Object.keys(newErrors).forEach(key => {
			if (newErrors[key] === null) delete newErrors[key];
		});

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				const signupRequest = {
					profilename: formData.profileName,
					profileType: formData.profileType.toUpperCase(),
					timeZone: formData.timeZone,
					email: formData.email,
					password: formData.password,
				};

				console.log('Enviando payload:', signupRequest);

				await AuthService.register(signupRequest);

				navigate('/login', { state: { message: t('auth.successRegistration') } });
			} catch (error) {
				// Validaciones backend
				console.error('Error en registro:', error);
				if (error.response?.data == 'Error: Username ya está en uso') {
					setServerError(t('auth.errorEmailInUse'));
				} else {
					setServerError(t('auth.errorConnection'));
				}
			} finally {
				setLoading(false);
			}
		}
	};

	return (
		<AuthLayout>
			<form
				onSubmit={handleSubmit}
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
						value={formData.profileName}
						onChange={e => handleChange('profileName', e.target.value)}
						className='bg-white'
						error={!!errors.profileName}
					/>
					{errors.profileName && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{t(errors.profileName)}
						</Typography>
					)}
				</div>

				{/* Tipo de Perfil Inicial */}
				<div>
					<Select
						label={t('profile.rolType')}
						size='lg'
						value={formData.profileType}
						onChange={val => handleChange('profileType', val)}
						className='bg-white'
						error={!!errors.profileType}
					>
						<Option value='WRITTEN'>{t('profile.narrative')}</Option>
						<Option value='TABLETOP'>{t('profile.table')}</Option>
					</Select>
					{errors.profileType && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{t(errors.profileType)}
						</Typography>
					)}

					<Typography variant='paragraph' className='mt-1 text-[12px] text-gray-500 italic'>
						* {t('auth.profileTypeNote')}
					</Typography>
				</div>

				{/* Zona Horaria */}
				<div>
					<Select
						label={t('account.timeZone')}
						size='lg'
						value={formData.timeZone}
						onChange={val => handleChange('timeZone', val)}
						className='bg-white'
						error={!!errors.timeZone}
					>
						{TIMEZONES.map(({ value, label }) => (
							<Option key={value} value={value}>
								{label}
							</Option>
						))}
					</Select>
					{errors.timeZone && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{t(errors.timeZone)}
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
						autoComplete='email'
						value={formData.email}
						onChange={e => handleChange('email', e.target.value)}
						className='bg-white'
						error={!!errors.email}
					/>
					{errors.email && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{t(errors.email)}
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
						value={formData.password}
						onChange={e => handleChange('password', e.target.value)}
						error={!!errors.password}
						className='bg-white'
						icon={
							<button type='button' onClick={() => setPasswordShown(!passwordShown)} className='focus:outline-none'>
								{passwordShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}
							</button>
						}
					/>
					{errors.password && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{t(errors.password)}
						</Typography>
					)}
				</div>

				<div>
					<Input
						label={t('account.confirmPassword')}
						size='lg'
						placeholder='********'
						type={confirmShown ? 'text' : 'password'}
						autoComplete='new-password'
						value={formData.confirmPassword}
						onChange={e => handleChange('confirmPassword', e.target.value)}
						className='bg-white'
						error={!!errors.confirmPassword}
						icon={
							<button type='button' onClick={() => setConfirmShown(!confirmShown)} className='focus:outline-none'>
								{confirmShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}
							</button>
						}
					/>
					{errors.confirmPassword && (
						<Typography variant='small' color='red' className='mt-1 text-xs'>
							{t(errors.confirmPassword)}
						</Typography>
					)}
				</div>
				<div className='lg:col-span-2 flex flex-col items-center mt-2'>
					<Button
						type='submit'
						color='red'
						size='lg'
						className='mt-1 flex justify-center items-center gap-2'
						disabled={loading}
					>
						{loading ? 'Creando cuenta...' : t('auth.signUp')}
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
