import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const PublicRoute = () => {
	const { account, loading } = useAuth();

	if (loading) return null;

	if (account) {
		return <Navigate to='/' replace />;
	}

	return <Outlet />;
};

export default PublicRoute;
