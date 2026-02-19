import Joi from 'joi';
import { Role } from '@/types';

export const registerSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(50).trim(),
    lastName: Joi.string().required().min(2).max(50).trim(),
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    phone: Joi.string().required().pattern(/^[0-9]{10,15}$/),
    role: Joi.string().valid(...Object.values(Role)).required(),
    storeId: Joi.string().pattern(/^c[^\s]+$/).optional()
});

export const loginSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required()
});

export const verifyAccountSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    code: Joi.string().required().length(6).pattern(/^[0-9]+$/)
});

export const requestPasswordResetSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim()
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    resetToken: Joi.string().required(),
    newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

export const logoutSchema = Joi.object({
    refreshToken: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).trim(),
    lastName: Joi.string().min(2).max(50).trim(),
    email: Joi.string().email().lowercase().trim(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/)
}).min(1);