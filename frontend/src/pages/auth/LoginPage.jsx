import { useState } from 'react';
import { Typography, Input, Button } from '@material-tailwind/react';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { NarrativeDrawer } from '../../components/auth/NarrativeDrawer';
import { TableDrawer } from '../../components/auth/TableDrawer';

export function LoginPage() {
	const { t } = useTranslation('global');
	const [passwordShown, setPasswordShown] = useState(false);
	const togglePasswordVisiblity = () => setPasswordShown(cur => !cur);

	return (
		<div className='flex min-h-screen w-full bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/papire-background.jpg')" }}>
			<NarrativeDrawer />
			<section className='flex-1 flex flex-col p-4 md:p-8'>
				<div className='w-full flex justify-center mt-4 md:mt-6'>
					<img src='/logo.png' alt='Logo' className='h-40 md:h-72 w-auto object-contain' />
				</div>
				<div className='flex-1 flex flex-col mt-5 items-center w-full'>
					<div className='w-full max-w-[24rem] text-center '>
						<Typography variant='h3' color='blue-gray' className='mb-12'>
							{t('auth.login')}
						</Typography>
						{/*<Typography className='mb-16 text-gray-600 font-normal text-[16px]'>{t('auth.enterEmailPassword')}</Typography>*/}
						<form action='#' className='mx-auto max-w-[24rem] text-left'>
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
									icon={
										<i onClick={togglePasswordVisiblity}>{passwordShown ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' />}</i>
									}
								/>
							</div>
							<Button color='gray' size='lg' className='mt-6' fullWidth>
								{t('auth.login')}
							</Button>
							<Typography variant='small' color='gray' className='!mt-4 text-center font-normal'>
								{t('auth.notRegistered')}?{' '}
								<a href='/register' className='font-medium text-gray-900'>
									{t('auth.createAccount')}
								</a>
							</Typography>
						</form>
					</div>
				</div>
				<div className='h-10'></div>
			</section>
			<TableDrawer />
		</div>
	);
}

export default LoginPage;
