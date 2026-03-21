import { ChatBubbleLeftRightIcon, DocumentMagnifyingGlassIcon, PencilSquareIcon, UserPlusIcon } from '@heroicons/react/24/solid';

export const menuItems = [
	{
		label: 'menu.findCampaign',
		path: '/find-campaign',
		icon: DocumentMagnifyingGlassIcon,
	},
	{
		label: 'menu.createCampaign',
		path: '/campaigns/create',
		icon: PencilSquareIcon,
	},
	{
		label: 'menu.createCharacter',
		path: '/createCharacter',
		icon: UserPlusIcon,
	},
	{
		label: 'menu.forum',
		path: '/forum',
		icon: ChatBubbleLeftRightIcon,
	}
	
];
