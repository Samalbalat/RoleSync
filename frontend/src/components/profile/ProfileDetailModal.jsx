import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogHeader, DialogBody, Typography, Avatar, Spinner, Button } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import profileService from '../../services/ProfileService';

export default function ProfileDetailModal({ isOpen, onClose, profileName, roleType }) {
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen && profileName) {
			setLoading(true);
			profileService
				.getProfileByName(roleType, profileName)
				.then(data => {
					setProfileData(data);
				})
				.catch(err => {
					console.error('Error al cargar el perfil:', err);
					setProfileData({ error: 'No se pudo cargar la información.' });
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			setProfileData(null);
		}
	}, [isOpen, profileName, roleType]);

	console.log('Perfil que pido:', profileName); // Debugging log
	console.log('Perfil que obtengo', profileData); // Debugging log

	return (
		<Dialog open={isOpen} handler={onClose} size='sm'>
			<DialogHeader className='justify-between border-b border-gray-100'>
				<Typography variant='h5' color='blue-gray'>
					Perfil de Jugador
				</Typography>
				<Button variant='text' color='blue-gray' size='sm' onClick={onClose} className='px-2'>
					<XMarkIcon className='h-5 w-5' />
				</Button>
			</DialogHeader>

			<DialogBody className='overflow-y-auto max-h-[60vh]'>
				{loading ? (
					<div className='flex justify-center py-8'>
						<Spinner color='blue' />
					</div>
				) : profileData?.error ? (
					<div className='text-center py-8'>
						<Typography color='red' className='font-medium'>
							{profileData.error}
						</Typography>
					</div>
				) : profileData ? (
					<div className='flex flex-col items-center space-y-6 py-4'>
						{/* Avatar destacado */}
						<Avatar
							src={
								profileData.image || profileData.profileImage || `https://ui-avatars.com/api/?name=${profileName}&size=256`
							}
							alt={profileData.profileName || profileName}
							size='xxl'
							className='h-32 w-32 shadow-md border-2 border-white'
						/>

						{/* Información del Perfil */}
						<div className='text-center space-y-4 w-full px-4'>
							<Typography variant='h4' color='blue-gray' className='font-bold'>
								{profileData.profileName || profileName}
							</Typography>

							{/* Caja de descripción */}
							{profileData.description ? (
								<div className='bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm'>
									<Typography className='text-gray-700 font-medium italic leading-relaxed text-sm'>
										"{profileData.description}"
									</Typography>
								</div>
							) : (
								<Typography className='text-gray-400 italic text-sm'>
									Este usuario aún no ha escrito una descripción.
								</Typography>
							)}
						</div>
					</div>
				) : (
					<Typography className='text-center text-gray-500 py-8'>No hay datos disponibles.</Typography>
				)}
			</DialogBody>
		</Dialog>
	);
}

ProfileDetailModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	profileName: PropTypes.string,
	roleType: PropTypes.string,
};
