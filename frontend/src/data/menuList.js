import { PresentationChartBarIcon, ShoppingBagIcon, UserCircleIcon, Cog6ToothIcon, InboxIcon } from '@heroicons/react/24/solid';

export const menuItems = [
	{
		label: 'menu.dashboard',
		path: '/',
		icon: PresentationChartBarIcon,
	},
	{
		label: 'menu.ecommerce',
		path: '/ecommerce',
		icon: ShoppingBagIcon,
	},
	{
		label: 'menu.inbox',
		path: '/inbox',
		icon: InboxIcon,
	},
	{
		label: 'menu.profile',
		path: '/profile',
		icon: UserCircleIcon,
	},
	{
		label: 'menu.settings',
		path: '/settings',
		icon: Cog6ToothIcon,
	},
];
