import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const ProtectedRoute = () => {
	const { account, loading } = useAuth();
	if (loading) return null;

	if (!account) {
		return <Navigate to='/login' replace />;
	}
	return <Outlet />;
};

export default ProtectedRoute;
