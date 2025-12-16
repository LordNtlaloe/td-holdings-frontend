import Joi from 'joi';

export const createEmployeeSchema = Joi.object({
    userId: Joi.string().required().messages({
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required'
    }),
    storeId: Joi.string().required().messages({
        'string.empty': 'Store ID is required',
        'any.required': 'Store ID is required'
    }),
    position: Joi.string().required().min(2).max(100).messages({
        'string.empty': 'Position is required',
        'string.min': 'Position must be at least 2 characters',
        'string.max': 'Position cannot exceed 100 characters',
        'any.required': 'Position is required'
    }),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'WAREHOUSE').required().messages({
        'any.only': 'Role must be one of: ADMIN, MANAGER, SUPERVISOR, CASHIER, WAREHOUSE',
        'any.required': 'Role is required'
    }),
    hireDate: Joi.date().max('now').optional().messages({
        'date.max': 'Hire date cannot be in the future'
    })
}).options({ stripUnknown: true });

export const updateEmployeeSchema = Joi.object({
    position: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'Position must be at least 2 characters',
        'string.max': 'Position cannot exceed 100 characters'
    }),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'WAREHOUSE').optional().messages({
        'any.only': 'Role must be one of: ADMIN, MANAGER, SUPERVISOR, CASHIER, WAREHOUSE'
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED').optional().messages({
        'any.only': 'Status must be one of: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED'
    }),
    terminationDate: Joi.date().max('now').optional().messages({
        'date.max': 'Termination date cannot be in the future'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
}).options({ stripUnknown: true });

export const transferEmployeeSchema = Joi.object({
    newStoreId: Joi.string().required().messages({
        'string.empty': 'New store ID is required',
        'any.required': 'New store ID is required'
    }),
    reason: Joi.string().required().min(10).max(1000).messages({
        'string.empty': 'Transfer reason is required',
        'string.min': 'Transfer reason must be at least 10 characters',
        'string.max': 'Transfer reason cannot exceed 1000 characters',
        'any.required': 'Transfer reason is required'
    })
}).options({ stripUnknown: true });

export const terminateEmployeeSchema = Joi.object({
    terminationDate: Joi.date().required().max('now').messages({
        'date.base': 'Termination date is required',
        'date.max': 'Termination date cannot be in the future',
        'any.required': 'Termination date is required'
    }),
    reason: Joi.string().max(500).optional().messages({
        'string.max': 'Reason cannot exceed 500 characters'
    })
}).options({ stripUnknown: true });

export const employeeFilterSchema = Joi.object({
    storeId: Joi.string().optional().messages({
        'string.empty': 'Store ID cannot be empty'
    }),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'WAREHOUSE').optional().messages({
        'any.only': 'Role must be one of: ADMIN, MANAGER, SUPERVISOR, CASHIER, WAREHOUSE'
    }),
    position: Joi.string().optional().messages({
        'string.empty': 'Position cannot be empty'
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED').optional().messages({
        'any.only': 'Status must be one of: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED'
    }),
    search: Joi.string().optional().messages({
        'string.empty': 'Search query cannot be empty'
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
    sortBy: Joi.string().valid('name', 'hireDate', 'performanceScore', 'role', 'position', 'status').optional().messages({
        'any.only': 'Sort by must be one of: name, hireDate, performanceScore, role, position, status'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc').messages({
        'any.only': 'Sort order must be either asc or desc'
    })
}).options({ stripUnknown: true });

export const employeePerformanceReportSchema = Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year').default('month').messages({
        'any.only': 'Period must be one of: day, week, month, year'
    })
}).options({ stripUnknown: true });

export const performanceReviewSchema = Joi.object({
    period: Joi.string().valid('MONTHLY', 'QUARTERLY', 'YEARLY').required().messages({
        'any.only': 'Period must be one of: MONTHLY, QUARTERLY, YEARLY',
        'any.required': 'Period is required'
    }),
    score: Joi.number().min(0).max(100).required().messages({
        'number.min': 'Score cannot be less than 0',
        'number.max': 'Score cannot exceed 100',
        'number.base': 'Score must be a number',
        'any.required': 'Score is required'
    }),
    feedback: Joi.string().max(2000).optional().messages({
        'string.max': 'Feedback cannot exceed 2000 characters'
    }),
    goals: Joi.array().items(Joi.string().min(2).max(500)).min(1).required().messages({
        'array.min': 'At least one goal is required',
        'array.base': 'Goals must be an array',
        'any.required': 'Goals are required'
    }),
    strengths: Joi.array().items(Joi.string().min(2).max(500)).min(1).required().messages({
        'array.min': 'At least one strength is required',
        'array.base': 'Strengths must be an array',
        'any.required': 'Strengths are required'
    }),
    areasForImprovement: Joi.array().items(Joi.string().min(2).max(500)).min(1).required().messages({
        'array.min': 'At least one area for improvement is required',
        'array.base': 'Areas for improvement must be an array',
        'any.required': 'Areas for improvement are required'
    })
}).options({ stripUnknown: true });

export const staffSummaryReportSchema = Joi.object({
    period: Joi.string().valid('current', 'month', 'quarter', 'year').default('current').messages({
        'any.only': 'Period must be one of: current, month, quarter, year'
    })
}).options({ stripUnknown: true });

export const paginationSchema = Joi.object({
    page: Joi.number().min(1).default(1).messages({
        'number.min': 'Page must be at least 1',
        'number.base': 'Page must be a number'
    }),
    limit: Joi.number().min(1).max(100).default(50).messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
        'number.base': 'Limit must be a number'
    })
}).options({ stripUnknown: true });

// Additional validation schemas for other employee operations
export const employeeIdSchema = Joi.object({
    employeeId: Joi.string().required().messages({
        'string.empty': 'Employee ID is required',
        'any.required': 'Employee ID is required'
    })
}).options({ stripUnknown: true });

export const storeIdSchema = Joi.object({
    storeId: Joi.string().required().messages({
        'string.empty': 'Store ID is required',
        'any.required': 'Store ID is required'
    })
}).options({ stripUnknown: true });

export const userIdSchema = Joi.object({
    userId: Joi.string().required().messages({
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required'
    })
}).options({ stripUnknown: true });