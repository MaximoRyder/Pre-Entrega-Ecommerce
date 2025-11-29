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

export const validateProductTitle = (title) => {
    if (!title || title.trim() === "") return "El título es obligatorio";
    if (title.length < 3) return "El título debe tener al menos 3 caracteres";
    if (title.length > 100)
        return "El título no puede tener más de 100 caracteres";
    return null;
};

export const validatePrice = (price) => {
    if (price === "" || price === null || price === undefined)
        return "El precio es obligatorio";
    const num = Number(price);
    if (isNaN(num)) return "El precio debe ser un número válido";
    if (num <= 0) return "El precio debe ser mayor a 0";
    return null;
};

export const validateQuantity = (quantity) => {
    if (quantity === "" || quantity === null || quantity === undefined)
        return "La cantidad es obligatoria";
    const num = Number(quantity);
    if (isNaN(num)) return "La cantidad debe ser un número válido";
    if (num <= 0) return "La cantidad debe ser mayor a 0";
    if (!Number.isInteger(num)) return "La cantidad debe ser un número entero";
    return null;
};

export const validateCategory = (category) => {
    if (!category || category === "") return "La categoría es obligatoria";
    return null;
};

export const validateUrl = (url) => {
    if (!url || url.trim() === "") return "La URL de la imagen es obligatoria";
    try {
        new URL(url);
        return null;
    } catch {
        return "Ingresa una URL válida";
    }
};