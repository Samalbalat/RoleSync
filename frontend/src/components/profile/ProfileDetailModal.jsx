import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogHeader, DialogBody, Typography, Avatar, Spinner, Button } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import profileService from '../../services/ProfileService';
import StarRatingBadge from '../reviews/StarRatingBadge';
import ReviewList from '../reviews/ReviewList';

const ProfileContent = ({ profileData, profileName }) => {
	const averageRating = Number(profileData?.reviewSummary?.average);
	const totalReviews = Number(profileData?.reviewSummary?.count);

	return (
		<div className='flex flex-col items-center space-y-6 py-4'>
			<Avatar
				src={profileData.image || profileData.profileImage || `https://ui-avatars.com/api/?name=${profileName}&size=256`}
				alt={profileData.profileName || profileName}
				size='xxl'
				className='h-32 w-32 shadow-md border-2 border-white shrink-0'
			/>

			<div className='text-center space-y-4 w-full px-4'>
				<div className='flex flex-col items-center gap-1.5'>
					<Typography variant='h4' color='blue-gray' className='font-bold'>
						{profileData.profileName || profileName}
					</Typography>
					<StarRatingBadge averageRating={averageRating} totalReviews={totalReviews} size='md' />
				</div>

				{profileData.description ? (
					<div className='bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto w-full'>
						<Typography className='text-gray-700 font-medium italic leading-relaxed text-sm'>
							"{profileData.description}"
						</Typography>
					</div>
				) : (
					<Typography className='text-gray-400 italic text-sm'>Este usuario aún no ha escrito una descripción.</Typography>
				)}
			</div>

			<div className='w-full mt-8 pt-8 border-t border-gray-100 text-left'>
				<ReviewList
					targetId={profileData.id}
					targetType='PROFILE'
					canWrite={true}
					averageRating={profileData.reviewSummary?.average}
					totalReviews={profileData.reviewSummary?.count}
				/>
			</div>
		</div>
	);
};

export default function ProfileDetailModal({ isOpen, onClose, profileName, roleType }) {
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isOpen || !profileName) {
			setProfileData(null);
			return;
		}

		setLoading(true);
		profileService
			.getProfileByName(roleType, profileName)
			.then(setProfileData)
			.catch(() => setProfileData({ error: 'No se pudo cargar la información.' }))
			.finally(() => setLoading(false));
	}, [isOpen, profileName, roleType]);

	// 2. Simplificamos la lógica de selección de contenido
	const renderDialogContent = () => {
		if (loading)
			return (
				<div className='flex justify-center py-8'>
					<Spinner color='blue' />
				</div>
			);

		if (profileData?.error)
			return (
				<div className='text-center py-8'>
					<Typography color='red' className='font-medium'>
						{profileData.error}
					</Typography>
				</div>
			);

		if (profileData) return <ProfileContent profileData={profileData} profileName={profileName} />;

		return <Typography className='text-center text-gray-500 py-8'>No hay datos disponibles.</Typography>;
	};

	return (
		<Dialog open={isOpen} handler={onClose} size='lg'>
			<DialogHeader className='justify-between border-b border-gray-100'>
				<Typography variant='h5' color='blue-gray'>
					Perfil de Jugador
				</Typography>
				<Button variant='text' color='blue-gray' size='sm' onClick={onClose} className='px-2'>
					<XMarkIcon className='h-5 w-5' />
				</Button>
			</DialogHeader>
			<DialogBody className='overflow-y-auto max-h-[75vh]'>{renderDialogContent()}</DialogBody>
		</Dialog>
	);
}

ProfileDetailModal.propTypes = {
	isOpen: PropTypes.bool,
	onClose: PropTypes.func,
	profileName: PropTypes.string,
	roleType: PropTypes.string,
};

ProfileContent.propTypes = {
	profileData: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		image: PropTypes.string,
		profileImage: PropTypes.string,
		profileName: PropTypes.string,
		description: PropTypes.string,
		reviewSummary: PropTypes.shape({
			average: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		}),
	}),
	profileName: PropTypes.string,
};
