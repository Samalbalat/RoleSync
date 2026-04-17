import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [account, setAccount] = useState(() => {
		const savedAccount = localStorage.getItem('accountEmail');
		return savedAccount ? { email: JSON.parse(savedAccount) } : null;
	});

	const [activeProfile, setActiveProfile] = useState(() => {
		const savedProfile = localStorage.getItem('activeProfile');
		return savedProfile ? JSON.parse(savedProfile) : null;
	});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				await AuthService.checkSession();
			} catch (error) {
				// Solo borramos la sesión si el error es 401 (No autorizado) o 403 (Prohibido)
				if (error.response?.status === 401 || error.response?.status === 403) {
					console.log('Sesión expirada');
					handleLocalLogout();
				} else {
					console.error('Error del servidor, manteniendo sesión local:', error);
				}
			} finally {
				setLoading(false);
			}
		};
		initAuth();
	}, []);
	const handleLocalLogout = () => {
		localStorage.clear();
		setAccount(null);
		setActiveProfile(null);
	};

	const login = async (email, password) => {
		const data = await AuthService.login(email, password);
		setAccount(data);
		return data;
	};

	const logout = async () => {
		try {
			await AuthService.logout();
		} catch (error) {
			console.error('Error al cerrar sesión en servidor (posiblemente ya expiró):', error);
		} finally {
			handleLocalLogout();
		}
	};

	return (
		<AuthContext.Provider value={{ account, setAccount, activeProfile, setActiveProfile, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
