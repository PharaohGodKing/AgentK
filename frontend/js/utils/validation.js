// Validation utility functions
export const validateRequired = (value, fieldName = 'This field') => {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    return null;
};

export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
};

export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number';
    }
    return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return null;
};

export const validateMinLength = (value, minLength, fieldName = 'This field') => {
    if (value && value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
};

export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
    if (value && value.length > maxLength) {
        return `${fieldName} must be no more than ${maxLength} characters long`;
    }
    return null;
};

export const validateNumber = (value, fieldName = 'This field') => {
    if (value && isNaN(Number(value))) {
        return `${fieldName} must be a valid number`;
    }
    return null;
};

export const validateMinValue = (value, minValue, fieldName = 'This field') => {
    const num = Number(value);
    if (!isNaN(num) && num < minValue) {
        return `${fieldName} must be at least ${minValue}`;
    }
    return null;
};

export const validateMaxValue = (value, maxValue, fieldName = 'This field') => {
    const num = Number(value);
    if (!isNaN(num) && num > maxValue) {
        return `${fieldName} must be no more than ${maxValue}`;
    }
    return null;
};

export const validateUrl = (url, fieldName = 'URL') => {
    if (!url) return null;
    
    try {
        new URL(url);
        return null;
    } catch {
        return `${fieldName} must be a valid URL`;
    }
};

export const validatePattern = (value, pattern, message, fieldName = 'This field') => {
    if (value && !pattern.test(value)) {
        return message || `${fieldName} format is invalid`;
    }
    return null;
};

export const validateAgentName = (name) => {
    const requiredError = validateRequired(name, 'Agent name');
    if (requiredError) return requiredError;
    
    const minLengthError = validateMinLength(name, 2, 'Agent name');
    if (minLengthError) return minLengthError;
    
    const maxLengthError = validateMaxLength(name, 100, 'Agent name');
    if (maxLengthError) return maxLengthError;
    
    const patternError = validatePattern(
        name,
        /^[a-zA-Z0-9 _-]+$/,
        'Agent name can only contain letters, numbers, spaces, hyphens, and underscores'
    );
    if (patternError) return patternError;
    
    return null;
};

export const validateAgentDescription = (description) => {
    if (!description) return null;
    
    const maxLengthError = validateMaxLength(description, 500, 'Agent description');
    if (maxLengthError) return maxLengthError;
    
    return null;
};

export const validateWorkflowName = (name) => {
    const requiredError = validateRequired(name, 'Workflow name');
    if (requiredError) return requiredError;
    
    const minLengthError = validateMinLength(name, 2, 'Workflow name');
    if (minLengthError) return minLengthError;
    
    const maxLengthError = validateMaxLength(name, 100, 'Workflow name');
    if (maxLengthError) return maxLengthError;
    
    return null;
};

export const validateModelConfig = (config) => {
    if (!config) return 'Model configuration is required';
    
    if (!config.modelType) {
        return 'Model type is required';
    }
    
    if (!config.modelName) {
        return 'Model name is required';
    }
    
    if (config.temperature !== undefined) {
        const tempError = validateMinValue(config.temperature, 0, 'Temperature');
        if (tempError) return tempError;
        
        const maxTempError = validateMaxValue(config.temperature, 2, 'Temperature');
        if (maxTempError) return maxTempError;
    }
    
    return null;
};

// Form validation helper
export const validateForm = (formData, validations) => {
    const errors = {};
    
    Object.keys(validations).forEach(field => {
        const value = formData[field];
        const fieldValidations = validations[field];
        
        if (Array.isArray(fieldValidations)) {
            for (const validation of fieldValidations) {
                const error = validation(value, formData);
                if (error) {
                    errors[field] = error;
                    break;
                }
            }
        } else if (typeof fieldValidations === 'function') {
            const error = fieldValidations(value, formData);
            if (error) {
                errors[field] = error;
            }
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Async validation helper
export const validateAsync = async (value, asyncValidator) => {
    try {
        const error = await asyncValidator(value);
        return error;
    } catch (error) {
        return 'Validation failed. Please try again.';
    }
};

// Export validation functions to global scope
window.AgentKValidation = {
    validateRequired,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateMinLength,
    validateMaxLength,
    validateNumber,
    validateMinValue,
    validateMaxValue,
    validateUrl,
    validatePattern,
    validateAgentName,
    validateAgentDescription,
    validateWorkflowName,
    validateModelConfig,
    validateForm,
    validateAsync
};