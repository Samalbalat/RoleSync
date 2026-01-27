import { useState } from 'react';
import { Typography, Input, Button } from '@material-tailwind/react';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/auth/AuthLayout';

export function LoginPage() {
	const { t } = useTranslation('global');
	const [passwordShown, setPasswordShown] = useState(false);
	const togglePasswordVisiblity = () => setPasswordShown(cur => !cur);

	return (
		<AuthLayout>
			<form action='#' className='mx-auto max-w-[32rem] text-left'>
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
						color='gray'
						size='lg'
						type='email'
						name='email'
						placeholder='name@mail.com'
						className='w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200'
						labelProps={{
							className: 'hidden',
						}}
					/>
				</div>
				<div className='mb-6'>
					<label htmlFor='password'>
						<Typography variant='small' className='mb-2 block font-medium text-gray-900'>
							{t('account.password')}
						</Typography>
					</label>
					<Input
						size='lg'
						placeholder='********'
						labelProps={{
							className: 'hidden',
						}}
						className='w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200'
						type={passwordShown ? 'text' : 'password'}
						icon={<i onClick={togglePasswordVisiblity}>{passwordShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}</i>}
					/>
				</div>
				<div className='flex justify-center mt-8'>
					<Button color='gray' size='lg'>
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
