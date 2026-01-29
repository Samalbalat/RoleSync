import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [account, setAccount] = useState(null);
	const [activeProfile, setActiveProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				await AuthService.checkSession();

				const savedProfile = JSON.parse(localStorage.getItem('activeProfile'));
				const savedAccount = JSON.parse(localStorage.getItem('accountEmail'));

				if (savedProfile && savedAccount) {
					setAccount({ email: savedAccount });
					setActiveProfile(savedProfile);
				} else {
					throw new Error('Sesión válida pero faltan datos locales');
				}
			} catch (error) {
				console.log('Error de sesión o no hay usuario:', error);
				localStorage.removeItem('activeProfile');
				localStorage.removeItem('accountEmail');
				setAccount(null);
				setActiveProfile(null);
			} finally {
				setLoading(false);
			}
		};
		initAuth();
	}, []);

	const login = async (email, password) => {
		const data = await AuthService.login(email, password);
		setAccount(data);
		return data;
	};

	return (
		<AuthContext.Provider value={{ account, setAccount, activeProfile, setActiveProfile, login, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
