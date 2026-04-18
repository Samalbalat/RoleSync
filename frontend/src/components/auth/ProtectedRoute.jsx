import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { Spinner } from '@material-tailwind/react';

const ProtectedRoute = () => {
	const { account, activeProfile, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className='flex flex-col h-screen w-full items-center justify-center bg-gray-50'>
				<Spinner className='h-12 w-12' color='blue' />
				<ServerWakingLoader isLoading={loading} />
			</div>
		);
	}

	if (!account) {
		return <Navigate to='/login' replace />;
	}

	if (!activeProfile && location.pathname !== '/profile-selection') {
		return <Navigate to='/profile-selection' replace />;
	}
	return <Outlet />;
};

export default ProtectedRoute;
