import Joi from 'joi';

export const LoginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),
    remember: Joi.boolean().optional()
});

export const RegisterSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your password'
        }),
    firstName: Joi.string()
        .min(2)
        .required()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.empty': 'First name is required',
            'any.required': 'First name is required'
        }),
    lastName: Joi.string()
        .min(2)
        .required()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.empty': 'Last name is required',
            'any.required': 'Last name is required'
        }),
    phone: Joi.string()
        .pattern(/^\+?[\d\s-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Please enter a valid phone number',
            'string.empty': 'Phone number is required',
            'any.required': 'Phone number is required'
        }),
    role: Joi.string()
        .valid('ADMIN', 'MANAGER', 'CASHIER')
        .required()
        .messages({
            'any.only': 'Please select a valid role',
            'any.required': 'Role is required'
        }),
    storeId: Joi.string().optional()
});

export const VerifyAccountSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    code: Joi.string()
        .length(6)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.length': 'Verification code must be 6 digits',
            'string.pattern.base': 'Verification code must contain only numbers',
            'string.empty': 'Verification code is required',
            'any.required': 'Verification code is required'
        })
});

export const RequestPasswordResetSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        })
});

export const ResetPasswordSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    resetToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Reset token is required',
            'any.required': 'Reset token is required'
        }),
    newPassword: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.empty': 'New password is required',
            'any.required': 'New password is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your new password'
        })
});

export const ChangePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Current password is required',
            'any.required': 'Current password is required'
        }),
    newPassword: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'New password must be at least 8 characters',
            'string.empty': 'New password is required',
            'any.required': 'New password is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your new password'
        })
});