import { useEffect, useState } from 'react';
import { Typography, Input, Button, Spinner } from '@material-tailwind/react';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export function LoginPage() {
	const { t } = useTranslation('global');
	const { login, setActiveProfile } = useAuth();
	const navigate = useNavigate();

	// Configuración de react-hook-form
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();

	const [passwordShown, setPasswordShown] = useState(false);
	// Cambiamos el nombre de error a apiError para diferenciarlo de los errors del formulario
	const [apiError, setApiError] = useState(null);

	const togglePasswordVisiblity = () => setPasswordShown(cur => !cur);

	const location = useLocation();
	const successMessage = location.state?.message;
	const errorMessage = location.state?.errorMessage;

	useEffect(() => {
		if (successMessage) {
			toast.success(successMessage, {
				id: 'registro-exito',
				style: { background: '#333', color: '#fff' },
			});
			window.history.replaceState({}, document.title);
		} else if (errorMessage) {
			toast.error(errorMessage, {
				id: 'auth-error',
				style: { background: '#333', color: '#fff' },
			});
			window.history.replaceState({}, document.title);
		}
	}, [successMessage, errorMessage]);

	const onSubmit = async data => {
		setApiError(null);

		try {
			const profiles = await login(data.email, data.password);

			if (Array.isArray(profiles) && profiles.length > 0) {
				const userEmail = profiles[0].email;
				localStorage.setItem('accountEmail', JSON.stringify(userEmail));

				// CASO A: Solo tiene 1 perfil -> Entrar directo (Auto-login)
				if (profiles.length === 1) {
					const p = profiles[0];
					const profileData = {
						name: p.profileName,
						type: p.roleType,
					};
					localStorage.setItem('activeProfile', JSON.stringify(profileData));
					setActiveProfile(profileData);

					navigate('/', { state: { message: t('auth.successLogin') } });
				}
				// CASO B: Tiene más de 1 perfil -> Selector de perfiles
				else {
					localStorage.setItem('availableProfiles', JSON.stringify(profiles));
					navigate('/profile-selection');
				}
			} else {
				setApiError(t('auth.errorNoProfilesFound'));
			}
		} catch (error) {
			console.error(error);
			const status = error.response?.status;

			// Lógica de errores 403 y 500 solicitada
			if (status === 403 || status === 401) {
				// Añado el 401 por seguridad, pero el 403 es el que prioriza tu backend
				setApiError(t('auth.errorInvalidCredentials'));
			} else if (status === 500) {
				setApiError(t('auth.errorServer'));
			} else {
				setApiError(t('auth.errorUnexpected'));
			}
		}
	};

	// Desestructuramos el ref de hook-form para pasarlo como inputRef a Material Tailwind
	const { ref: emailRef, ...emailRest } = register('email', {
		required: t('auth.emailRequired'),
		pattern: {
			value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
			message: t('auth.invalidEmail'),
		},
	});
	const { ref: passwordRef, ...passwordRest } = register('password', {
		required: t('auth.passwordRequired'),
	});

	return (
		<AuthLayout>
			{/* Cambiamos el onSubmit para usar handleSubmit de react-hook-form */}
			<form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-[32rem] text-left'>
				<div className='lg:col-span-2 text-center mb-2'>
					<Typography variant='h3' color='blue-gray'>
						{t('auth.login')}
					</Typography>
				</div>

				<div className='mb-6'>
					<label htmlFor='email'>
						<Typography variant='small' className='mb-2 block font-medium text-gray-900'>
							{t('account.email')}
						</Typography>
					</label>
					<Input
						id='email'
						type='email'
						placeholder='name@mail.com'
						color='gray'
						size='lg'
						autoComplete='new-password'
						className='w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200'
						labelProps={{ className: 'hidden' }}
						// Inyectamos las props de react-hook-form
						inputRef={emailRef}
						{...emailRest}
						error={!!errors.email}
					/>
					{/* Mensaje de error de validación del formulario */}
					{errors.email && (
						<Typography variant='small' color='red' className='mt-1 text-sm font-normal'>
							{errors.email.message}
						</Typography>
					)}
				</div>

				<div className='mb-6'>
					<label htmlFor='password'>
						<Typography variant='small' className='mb-2 block font-medium text-gray-900'>
							{t('account.password')}
						</Typography>
					</label>
					<Input
						id='password'
						type={passwordShown ? 'text' : 'password'}
						size='lg'
						placeholder='********'
						autoComplete='new-password'
						labelProps={{ className: 'hidden' }}
						className='w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200'
						icon={
							<i className='cursor-pointer' onClick={togglePasswordVisiblity}>
								{passwordShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}
							</i>
						}
						// Inyectamos las props de react-hook-form
						inputRef={passwordRef}
						{...passwordRest}
						error={!!errors.password}
					/>
					{errors.password && (
						<Typography variant='small' color='red' className='mt-1 text-sm font-normal'>
							{errors.password.message}
						</Typography>
					)}
				</div>

				{apiError && (
					<Typography color='red' className='mb-4 text-center font-medium'>
						{apiError}
					</Typography>
				)}

				<div className='flex justify-center mt-8'>
					{/* Deshabilitamos el botón para evitar doble submit */}
					<Button type='submit' color='gray' size='lg' disabled={isSubmitting}>
						{isSubmitting ? <Spinner className='h-5 w-5 mx-auto' /> : t('auth.login')}
					</Button>
				</div>

				<Typography variant='small' color='gray' className='!mt-4 text-center font-normal'>
					{t('auth.notRegistered')}?{' '}
					<a href='/register' className='font-medium text-gray-900'>
						{t('auth.createAccount')}
					</a>
				</Typography>
			</form>
		</AuthLayout>
	);
}

export default LoginPage;
