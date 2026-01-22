import React from 'react';
import { List, ListItem, ListItemPrefix } from '@material-tailwind/react';
import { PresentationChartBarIcon, ShoppingBagIcon, UserCircleIcon, Cog6ToothIcon, InboxIcon } from '@heroicons/react/24/solid';

export const navList = (
	<List>
		<a href='/list_campaigns'>
			<ListItem>
				<ListItemPrefix>
					<PresentationChartBarIcon className='h-5 w-5' />
				</ListItemPrefix>
				Buscar campañas
			</ListItem>
		</a>
		<a href='/create-campaign'>
			<ListItem>
				<ListItemPrefix>
					<ShoppingBagIcon className='h-5 w-5' />
				</ListItemPrefix>
				Crear Campaña
			</ListItem>
		</a>
		<a href='/'>
			<ListItem>
				<ListItemPrefix>
					<InboxIcon className='h-5 w-5' />
				</ListItemPrefix>
				Crear personaje
			</ListItem>
		</a>
		<a href='/userprofile'>
			<ListItem>
				<ListItemPrefix>
					<UserCircleIcon className='h-5 w-5' />
				</ListItemPrefix>
				Perfil
			</ListItem>
		</a>
		<a href='/'>
			<ListItem>
				<ListItemPrefix>
					<Cog6ToothIcon className='h-5 w-5' />
				</ListItemPrefix>
				Settings
			</ListItem>
		</a>
	</List>
);
