import { Card, CardBody, CardHeader, CardFooter, Typography, Avatar, Button } from '@material-tailwind/react';
import React from 'react';
import PropTypes from 'prop-types';
import userData from '../../fakedata/userData.js';
import Profile from './profile.jsx';

const NewProfile = ({ tipo }) => {
	NewProfile.propTypes = {
		tipo: PropTypes.oneOf(['narrative', 'table']).isRequired,
	};
	return (
		<Card className='p-4 w-full max-w-md shadow-lg border border-blue-gray-100 h-min'>
			<CardHeader floated={false} className='flex flex-col items-center h-40 bg-blue-gray-50'>
				<img
					src={tipo === 'narrative' ? '/table-header.jpg' : '/narrative-header.jpg'}
					alt={tipo === 'narrative' ? 'Perfil de Mesa' : 'Perfil Narrativo'}
					className='object-cover w-full h-full'
				/>
			</CardHeader>
			<CardBody className='flex flex-col items-center justify-center -mt-16'>
				<Avatar src={'/avatar_example.svg'} alt='Ejemplo perfil' size='xxl' className='border-4 border-white' />
				<Typography variant='h4' className='font-bold text-blue-gray-700'>
					{tipo === 'table' ? 'Añadir perfil Narrativo' : 'Añadir perfil de Mesa'}
				</Typography>
				<Typography variant='paragraph' color='gray' className='mb-4 text-center'>
					Crea un nuevo perfil para {tipo === 'table' ? 'narrativa' : 'mesa'} si quieres probar un tipo de rol diferente.
				</Typography>
				<Button color={tipo === 'table' ? 'purple' : 'red'} variant='gradient' size='md' className='mt-2'>
					Añadir perfil
				</Button>
			</CardBody>
		</Card>
	);
};

export default function UserProfile({ isMobileSize }) {
	UserProfile.propTypes = {
		isMobileSize: PropTypes.bool.isRequired,
	};

	return (
		<>
			<Card className='w-full px-6 justify-center'>
				<div className='flex flex-row flex-wrap items-center justify-between'>
					<div className='items-center justify-be py-3 my-1'>
						<Typography color='gray' variant='small' className='mb-1'>
							Nombre de usuario
						</Typography>
						<Typography color='blue-gray' variant='paragraph'>
							{userData.username}
						</Typography>
					</div>
					<div className='items-center justify-left py-3 my-1'>
						<Typography color='gray' variant='small' className='mb-1'>
							Correo electrónico
						</Typography>
						<Typography color='blue-gray' variant='paragraph'>
							{userData.email}
						</Typography>
					</div>
					<div className='items-center justify-left py-3 my-1'>
						<Typography color='gray' variant='small' className='mb-1'>
							Horario GTM
						</Typography>
						<Typography color='blue-gray' variant='paragraph'>
							{userData.gtm}
						</Typography>
					</div>
				</div>
			</Card>
			<div className='flex flex-row flex-wrap justify-center gap-4 mt-1'>
				<Button className='mt-4' color='blue-gray' variant='gradient' size='sm'>
					Editar Usuario
				</Button>
				<Button className='mt-4' color='blue-gray' variant='gradient' size='sm'>
					Cambiar Contraseña
				</Button>
				<Button className='mt-4' color='red' variant='outlined' size='sm'>
					Eliminar Cuenta
				</Button>
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-14 mt-6'>
				{console.log(Object.keys(userData.profile).length)}
				{Object.keys(userData.profile).length === 2 && (
					<>
						<Profile profile={userData.profile[1]} isMobileSize={isMobileSize} />
						<Profile profile={userData.profile[2]} isMobileSize={isMobileSize} />
					</>
				)}
				{Object.keys(userData.profile).length === 1 && userData.profile[1].type === 'narrative' && (
					<>
						<Profile profile={userData.profile[1]} isMobileSize={isMobileSize} />
						<NewProfile tipo={'narrative'} />
					</>
				)}
				{Object.keys(userData.profile).length === 1 && userData.profile[1].type === 'table' && (
					<>
						<Profile profile={userData.profile[1]} isMobileSize={isMobileSize} />
						<NewProfile tipo={'table'} />
					</>
				)}
			</div>
		</>
	);
}
