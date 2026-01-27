// Formato Email
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'errors.required';
    if (!regex.test(email)) return 'errors.invalidEmail';
    return null; 
};

// Complejidad de Contraseña
export const validatePassword = (password) => {
    if (!password) return 'errors.required';
    if (password.length < 8) return 'errors.passwordLength';
    
    
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]+$/;
    
    if (!complexityRegex.test(password)) return 'errors.passwordComplexity';
    return null;
};

// Campo obligatorio genérico
export const validateRequired = (value) => {
    if (!value || value.trim() === '') return 'errors.required';
    return null; 
};