import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
	const { t } = useTranslation('global');
	return (
		<footer className='bg-gray-800 text-white p-4'>
			<div className='container mx-auto text-center'>
				<p className='text-sm'>
					&copy; {new Date().getFullYear()} {t('footer.copyright')}
				</p>
				<p className='text-xs mt-2'>{t('footer.madeWithLove')}</p>
			</div>
		</footer>
	);
};
export default Footer;
