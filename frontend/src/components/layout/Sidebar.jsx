import React from 'react';
import { Card, Typography, List, ListItem, ListItemPrefix } from '@material-tailwind/react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../../data/menuList'; // Importamos el array, no el JSX

export default function Sidebar() {
	return (
		<Card className='h-full w-full p-4 shadow-none bg-gray-100 rounded-none border-r border-gray-300'>
			<div className='mb-2 p-4'>
				<Typography variant='h5' color='blue-gray'>
					Menu
				</Typography>
			</div>

			<List>
				{menuItems.map(({ icon, label, path }) => {
					// Tenemos que asignar el icono a una variable porque si no da error el Linter ESLint xd
					const Icon = icon;

					return (
						<NavLink to={path} key={label}>
							{({ isActive }) => (
								<ListItem className={`${isActive ? 'bg-blue-gray-50 text-blue-gray-900' : ''}`}>
									<ListItemPrefix>
										<Icon className='h-5 w-5' />
									</ListItemPrefix>
									{label}
								</ListItem>
							)}
						</NavLink>
					);
				})}
			</List>
		</Card>
	);
}
