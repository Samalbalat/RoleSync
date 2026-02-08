import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@material-tailwind/react';

const ProtectedRoute = () => {
	const { t } = useTranslation('global');
	const { account, loading } = useAuth();
	const location = useLocation();
	if (loading) {
		return (
			<div className='flex h-screen w-full items-center justify-center bg-gray-50'>
				<Spinner className='h-12 w-12' color='blue' />
			</div>
		);
	}

	if (!account) {
		if (location.pathname === '/') {
			return <Navigate to='/login' replace />;
		}
		return <Navigate to='/login' replace state={{ errorMessage: t('auth.errorNotAuthenticated') }} />;
	}
	return <Outlet />;
};

export default ProtectedRoute;
