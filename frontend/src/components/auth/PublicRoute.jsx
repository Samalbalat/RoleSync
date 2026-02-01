import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { Spinner } from '@material-tailwind/react';

const PublicRoute = () => {
	const { account, loading } = useAuth();

	if (loading) {
		return (
			<div className='flex h-screen w-full items-center justify-center bg-gray-50'>
				<Spinner className='h-12 w-12' color='blue' />
			</div>
		);
	}

	if (account) {
		return <Navigate to='/' replace />;
	}

	return <Outlet />;
};

export default PublicRoute;
