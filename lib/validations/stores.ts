import Joi from 'joi';

export const storeSchema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
        'string.empty': 'Store name is required',
        'string.min': 'Store name must be at least 2 characters',
        'string.max': 'Store name cannot exceed 100 characters',
        'any.required': 'Store name is required'
    }),
    location: Joi.string().required().min(5).max(200).messages({
        'string.empty': 'Store location is required',
        'string.min': 'Store location must be at least 5 characters',
        'string.max': 'Store location cannot exceed 200 characters',
        'any.required': 'Store location is required'
    }),
    phone: Joi.string().required().pattern(/^[\d\s\-+()]+$/).messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid phone number',
        'any.required': 'Phone number is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    isMainStore: Joi.boolean().default(false).messages({
        'boolean.base': 'Main store must be a boolean value'
    })
}).options({ stripUnknown: true });

export const storeUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'Store name must be at least 2 characters',
        'string.max': 'Store name cannot exceed 100 characters'
    }),
    location: Joi.string().min(5).max(200).optional().messages({
        'string.min': 'Store location must be at least 5 characters',
        'string.max': 'Store location cannot exceed 200 characters'
    }),
    phone: Joi.string().pattern(/^[\d\s\-+()]+$/).optional().messages({
        'string.pattern.base': 'Please enter a valid phone number'
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Please enter a valid email address'
    }),
    isMainStore: Joi.boolean().optional().messages({
        'boolean.base': 'Main store must be a boolean value'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
}).options({ stripUnknown: true });

export const storeIdSchema = Joi.object({
    storeId: Joi.string().required().messages({
        'string.empty': 'Store ID is required',
        'any.required': 'Store ID is required'
    })
}).options({ stripUnknown: true });

export const storeFilterSchema = Joi.object({
    search: Joi.string().optional().messages({
        'string.empty': 'Search query cannot be empty'
    }),
    isMainStore: Joi.boolean().optional().messages({
        'boolean.base': 'Main store filter must be true or false'
    }),
    page: Joi.number().min(1).default(1).messages({
        'number.min': 'Page must be at least 1',
        'number.base': 'Page must be a number'
    }),
    limit: Joi.number().min(1).max(100).default(50).messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
        'number.base': 'Limit must be a number'
    }),
    sortBy: Joi.string().valid('name', 'location', 'createdAt', 'isMainStore').optional().messages({
        'any.only': 'Sort by must be one of: name, location, createdAt, isMainStore'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc').messages({
        'any.only': 'Sort order must be either asc or desc'
    })
}).options({ stripUnknown: true });

export const storeReportSchema = Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').default('month').messages({
        'any.only': 'Period must be one of: day, week, month, quarter, year'
    }),
    storeId: Joi.string().optional().messages({
        'string.empty': 'Store ID cannot be empty'
    })
}).options({ stripUnknown: true });

export const storeInventorySchema = Joi.object({
    productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
        'any.required': 'Product ID is required'
    }),
    quantity: Joi.number().min(1).required().messages({
        'number.min': 'Quantity must be at least 1',
        'number.base': 'Quantity must be a number',
        'any.required': 'Quantity is required'
    }),
    reorderPoint: Joi.number().min(0).optional().messages({
        'number.min': 'Reorder point cannot be negative',
        'number.base': 'Reorder point must be a number'
    })
}).options({ stripUnknown: true });

export const storeStaffSchema = Joi.object({
    employeeIds: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': 'At least one employee must be assigned',
        'array.base': 'Employee IDs must be an array',
        'any.required': 'Employee IDs are required'
    })
}).options({ stripUnknown: true });