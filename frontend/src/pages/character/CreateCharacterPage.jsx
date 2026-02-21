import React from 'react';
import DynamicCharacterForm from '../../components/character/DynamicCharacterForm';
import { mockTemplates } from '../../data/mockCharacters';
import { Typography } from '@material-tailwind/react';

export default function CreateCharacterPage() {
	// Simulamos que hemos hecho una petición al backend (GET /templates/1)
	// y nos ha devuelto la plantilla de fantasía.
	const currentTemplate = mockTemplates;

	return (
		<div className='min-h-screen bg-gray-100 py-10'>
			<div className='container mx-auto px-4'>
				<div className='mb-8 text-center'>
					<Typography variant='h2' color='blue-gray'>
						{currentTemplate.campaign_name}
					</Typography>
				</div>

				<DynamicCharacterForm templateData={currentTemplate} />
			</div>
		</div>
	);
}
