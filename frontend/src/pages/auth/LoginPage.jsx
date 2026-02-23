import { useEffect, useRef, useState } from 'react';
import { Typography, Input, Button } from '@material-tailwind/react';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export function LoginPage() {
	const { t } = useTranslation('global');
	const { login, setActiveProfile } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const passwordRef = useRef(null);
	const [passwordShown, setPasswordShown] = useState(false);
	const [error, setError] = useState(null);

	const togglePasswordVisiblity = () => setPasswordShown(cur => !cur);

	const location = useLocation();
	const successMessage = location.state?.message;
	const errorMessage = location.state?.errorMessage;
	useEffect(() => {
		if (successMessage) {
			toast.success(successMessage, {
				id: 'registro-exito',
				style: {
					background: '#333',
					color: '#fff',
				},
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

	const handleLogin = async e => {
		e.preventDefault();
		setError(null);
		const passwordValue = passwordRef.current.value;

		try {
			const profiles = await login(email, passwordValue);

			console.log('Perfiles recibidos:', profiles);

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
				setError(t('auth.errorNoProfilesFound'));
			}
		} catch (error) {
			console.error(error);
			if (error.response?.status === 401) {
				setError(t('auth.errorInvalidCredentials'));
			} else {
				setError(t('auth.errorConnection'));
			}
		}
	};
	return (
		<AuthLayout>
			<form onSubmit={handleLogin} className='mx-auto max-w-[32rem] text-left'>
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
						name='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder='name@mail.com'
						color='gray'
						size='lg'
						className='w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200'
						labelProps={{ className: 'hidden' }}
					/>
				</div>

				<div className='mb-6'>
					<label htmlFor='password'>
						<Typography variant='small' className='mb-2 block font-medium text-gray-900'>
							{t('account.password')}
						</Typography>
					</label>
					<Input
						id='password'
						name='password'
						inputRef={passwordRef}
						type={passwordShown ? 'text' : 'password'}
						size='lg'
						placeholder='********'
						autoComplete='off'
						labelProps={{ className: 'hidden' }}
						className='w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200'
						icon={
							<i className='cursor-pointer' onClick={togglePasswordVisiblity}>
								{passwordShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}
							</i>
						}
					/>
				</div>

				{error && (
					<Typography color='red' className='mb-4 text-center'>
						{error}
					</Typography>
				)}

				<div className='flex justify-center mt-8'>
					<Button type='submit' color='gray' size='lg'>
						{t('auth.login')}
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
