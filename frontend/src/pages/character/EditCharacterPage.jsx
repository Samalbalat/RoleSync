import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spinner } from '@material-tailwind/react';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../utils/themeUtils';
import CharacterService from '../../services/CharacterService';
import EditCharacterForm from '../../components/character/EditCharacterForm';
import AccessDeniedView from '../../components/layout/AccesDeniedView';

export default function EditCharacterPage() {
	const { id: characterId } = useParams();
	const { t } = useTranslation('global');
	const theme = getTheme();
	const navigate = useNavigate();

	const [characterData, setCharacterData] = useState(null);
	const [accessDenied, setAccessDenied] = useState(false);
	const [loading, setLoading] = useState(true);
	const storedProfile = JSON.parse(localStorage.getItem('activeProfile'));

	useEffect(() => {
		const fetchCharacter = async () => {
			try {
				setLoading(true);

				const data = await CharacterService.getCharacterById(characterId);

				const profileName = storedProfile?.name?.trim().toLowerCase();
				const username = data?.username?.trim().toLowerCase();
				if (profileName && username && profileName !== username) {
					setAccessDenied(true);
					return;
				}
				setCharacterData(data);
			} catch (error) {
				if (error.response?.status === 404) {
					setAccessDenied(true);
				} else {
					console.error('Error al cargar el personaje para editar:', error);
					navigate(-1);
				}
			} finally {
				setLoading(false);
			}
		};

		if (characterId) {
			fetchCharacter();
		}
	}, [characterId, navigate]);

	if (loading) {
		return (
			<div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center`}>
				<Spinner className={`h-12 w-12 text-${theme.primary}-500`} />
				<Typography color='gray' className='mt-4'>
					{t('common.loading', 'Cargando personaje...')}
				</Typography>
			</div>
		);
	}

	if (accessDenied) {
		return <AccessDeniedView t={t} type={'character'} />;
	}

	return (
		<div className={`min-h-screen bg-gray-50 py-10`}>
			<div className='container mx-auto px-4'>
				<EditCharacterForm characterData={characterData} />
			</div>
		</div>
	);
}
