export const validateName = (name, min = 10, max = 100) => {
    if (!name || name.trim() === "") return "El nombre es obligatorio";
    if (name.length < min) return `El nombre debe tener al menos ${min} caracteres`;
    if (name.length > max)
        return `El nombre no puede tener más de ${max} caracteres`;
    return null;
};

export const validateEmail = (email, min = 10, max = 100) => {
    if (!email || email.trim() === "") return "El email es obligatorio";
    if (email.length < min) return `El email debe tener al menos ${min} caracteres`;
    if (email.length > max)
        return `El email no puede tener más de ${max} caracteres`;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) return "El formato del email no es válido";
    return null;
};

export const validatePassword = (password, min = 4, max = 20) => {
    if (!password || password.trim() === "") return "La contraseña es obligatoria";
    if (password.length < min)
        return `La contraseña debe tener al menos ${min} caracteres`;
    if (password.length > max)
        return `La contraseña no puede tener más de ${max} caracteres`;
    return null;
};