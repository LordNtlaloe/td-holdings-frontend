// schema-joi.ts
import Joi from 'joi';

export const LoginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
        }),
    password: Joi.string()
        .min(6, 'utf8')
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.empty': 'Password is required',
        }),
    remember: Joi.boolean().default(false)
});

export const SignUpSchema = Joi.object({
    firstName: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.min': 'First name is required',
            'string.empty': 'First name is required',
        }),
    lastName: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.min': 'Last name is required',
            'string.empty': 'Last name is required',
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
        }),
    phone: Joi.string()
        .pattern(/^\+?[\d\s\-()]+$/)
        .allow('')
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid phone number',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.empty': 'Password is required',
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Please confirm your password',
        }),
    role: Joi.string()
        .valid('ADMIN', 'MANAGER', 'CASHIER')
        .default('CASHIER')
        .messages({
            'any.only': 'Please select a valid role',
        }),
    storeId: Joi.string()
        .allow('')
        .optional(),
});

export type LoginFormData = {
    email: string;
    password: string;
    remember: boolean;
};

export type SignUpFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    role: 'ADMIN' | 'MANAGER' | 'CASHIER';
    storeId?: string;
};