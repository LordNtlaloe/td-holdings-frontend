import Joi from 'joi';

export const storeSchema = Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Store name is required',
        'string.min': 'Store name must be at least 1 character',
        'string.max': 'Store name must be less than 100 characters',
    }),
    location: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Location is required',
        'string.min': 'Location must be at least 1 character',
        'string.max': 'Location must be less than 200 characters',
    }),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).required().messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid phone number',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
    }),
    isMainStore: Joi.boolean().default(false),
});

export const storeUpdateSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    location: Joi.string().min(1).max(200).optional(),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).optional(),
    email: Joi.string().email({ tlds: { allow: false } }).optional(),
    isMainStore: Joi.boolean().optional(),
}).min(1).messages({
    'object.min': 'At least one field must be updated',
});

export const storePerformanceSchema = Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year').default('month'),
});