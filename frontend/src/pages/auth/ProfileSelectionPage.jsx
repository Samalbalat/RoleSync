import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Avatar } from '@material-tailwind/react';
import { UserIcon } from '@heroicons/react/24/solid';
import { FaDiceD20 } from 'react-icons/fa';
import { IoMdChatbubbles } from 'react-icons/io';
import { useAuth } from '../../utils/AuthContext';
import { useTranslation } from 'react-i18next';

export function ProfileSelectionPage() {
	const navigate = useNavigate();
	const { t } = useTranslation('global');
	const { setActiveProfile, setAccount } = useAuth();
	const [profiles, setProfiles] = useState([]);

	useEffect(() => {
		const storedProfiles = localStorage.getItem('availableProfiles');
		if (storedProfiles) {
			setProfiles(JSON.parse(storedProfiles));
		} else {
			navigate('/login');
		}
	}, [navigate]);

	const handleSelectProfile = profile => {
		const activeData = {
			name: profile.profileName,
			type: profile.roleType,
			image: profile.image || null,
		};

		localStorage.setItem('activeProfile', JSON.stringify(activeData));
		setActiveProfile(activeData);

		const email = JSON.parse(localStorage.getItem('accountEmail'));
		if (email) setAccount({ email });

		navigate('/');
	};

	const getIcon = (type, image) => {
		if (image) return <Avatar src={image} alt='profile' size='xl' variant='circular' />;

		if (type === 'WRITTEN') return <IoMdChatbubbles className='h-12 w-12 text-purple-500' />;
		if (type === 'TABLETOP') return <FaDiceD20 className='h-12 w-12 text-red-500' />;
		return <UserIcon className='h-12 w-12 text-gray-500' />;
	};

	const getLabel = type => {
		if (type === 'WRITTEN') return t('profile.narrative');
		if (type === 'TABLETOP') return t('profile.table');
		return type;
	};

	return (
		<div
			className='flex min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed'
			style={{ backgroundImage: "url('/papire-background.jpg')" }}
		>
			{/* Overlay para que el fondo no distraiga tanto de las cards */}
			<div className='absolute inset-0 bg-black/30' />

			<div className='relative z-10 min-h-screen w-full flex flex-col justify-center items-center p-4'>
				<div className='flex justify-center mb-8'>
					<img src='/logo.png' alt='Logo' className='h-32 md:h-56 w-auto object-contain drop-shadow-2xl' />
				</div>

				<Typography variant='h2' color='white' className='mb-12 text-center drop-shadow-md'>
					{t('auth.whoAreYou')}
				</Typography>

				<div className='flex flex-wrap gap-8 justify-center max-w-5xl'>
					{profiles.map(profile => (
						<div key={`${profile.profileName}-${profile.roleType}`} className='group'>
							<Card
								className='w-44 h-44 md:w-52 md:h-52 cursor-pointer bg-white/90 backdrop-blur-sm 
                                           hover:bg-white border-2 border-transparent hover:border-orange-500 
                                           transition-all duration-300 shadow-xl'
								onClick={() => handleSelectProfile(profile)}
							>
								<CardBody className='flex flex-col items-center justify-center h-full p-4'>
									<div className='p-4 bg-gray-100 rounded-full group-hover:bg-orange-50 transition-colors'>
										{getIcon(profile.roleType, profile.image)}
									</div>
									<Typography variant='h5' color='blue-gray' className='mt-4 font-bold capitalize'>
										{profile.profileName}
									</Typography>
									<Typography variant='small' className='font-medium text-orange-700 uppercase tracking-tighter'>
										{getLabel(profile.roleType)}
									</Typography>
								</CardBody>
							</Card>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default ProfileSelectionPage;
