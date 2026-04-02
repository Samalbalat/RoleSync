import React from 'react';
import { Typography } from '@material-tailwind/react';

export default function EditCharacterPage() {
	return (
		<div className={`min-h-screen bg-gray-50 py-10`}>
			<div className='container mx-auto px-4'>
				<Typography variant='h2' color='blue-gray' className='mb-6 text-center'>
					Editar Personaje
				</Typography>
				<Typography color='gray' className='mb-8 text-center'>
					Aquí podrás modificar los detalles de tu personaje. Asegúrate de guardar los cambios antes de salir.
				</Typography>
			</div>
		</div>
	);
}
