import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Avatar } from '@material-tailwind/react';
import { UserIcon, BookOpenIcon, TableCellsIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../utils/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout'; // Usamos tu layout existente

export function ProfileSelectionPage() {
	const navigate = useNavigate();
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
			type: profile.profileType,
		};

		localStorage.setItem('activeProfile', JSON.stringify(activeData));
		setActiveProfile(activeData);

		const email = JSON.parse(localStorage.getItem('accountEmail'));
		if (email) setAccount({ email });

		navigate('/');
	};

	const getIcon = type => {
		if (type === 'WRITTEN') return <BookOpenIcon className='h-12 w-12 text-blue-500' />;
		if (type === 'TABLETOP') return <TableCellsIcon className='h-12 w-12 text-red-500' />;
		return <UserIcon className='h-12 w-12 text-gray-500' />;
	};

	const getLabel = type => {
		if (type === 'WRITTEN') return 'Rol Narrativo';
		if (type === 'TABLETOP') return 'Rol de Mesa';
		return type;
	};

	return (
		<div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4'>
			<Typography variant='h2' color='blue-gray' className='mb-8 text-center'>
				¿Quién eres hoy?
			</Typography>

			<div className='flex flex-wrap gap-6 justify-center max-w-4xl'>
				{profiles.map((profile, index) => (
					<Card
						key={index}
						className='w-48 h-48 cursor-pointer hover:scale-105 transition-transform hover:shadow-xl border border-gray-200'
						onClick={() => handleSelectProfile(profile)}
					>
						<CardBody className='flex flex-col items-center justify-center h-full gap-4'>
							<div className='p-4 bg-gray-50 rounded-full'>{getIcon(profile.profileType)}</div>

							<div className='text-center'>
								<Typography variant='h5' color='blue-gray' className='font-bold capitalize'>
									{profile.profileName}
								</Typography>
								<Typography variant='small' color='gray' className='font-normal'>
									{getLabel(profile.profileType)}
								</Typography>
							</div>
						</CardBody>
					</Card>
				))}
			</div>
		</div>
	);
}

export default ProfileSelectionPage;
