import React from 'react';
import { List, ListItem, ListItemPrefix } from '@material-tailwind/react';
import {
	PresentationChartBarIcon,
	ShoppingBagIcon,
	UserCircleIcon,
	Cog6ToothIcon,
	InboxIcon,
} from '@heroicons/react/24/solid';

export const navList = (
	<List>
		<ListItem>
			<ListItemPrefix>
				<PresentationChartBarIcon className='h-5 w-5' />
			</ListItemPrefix>
			<a href='/'> Dashboard </a>
		</ListItem>
		<ListItem>
			<ListItemPrefix>
				<ShoppingBagIcon className='h-5 w-5' />
			</ListItemPrefix>
			<a href='/'>E-Commerce</a>
		</ListItem>
		<ListItem>
			<ListItemPrefix>
				<InboxIcon className='h-5 w-5' />
			</ListItemPrefix>
			<a href='/'>Inbox</a>
		</ListItem>
		<ListItem>
			<ListItemPrefix>
				<UserCircleIcon className='h-5 w-5' />
			</ListItemPrefix>
			<a href='/'>Profile</a>
		</ListItem>
		<ListItem>
			<ListItemPrefix>
				<Cog6ToothIcon className='h-5 w-5' />
			</ListItemPrefix>
			<a href='/'>Settings</a>
		</ListItem>
	</List>
);
