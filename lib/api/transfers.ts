import Joi from 'joi';
import { TransferStatus } from '@/types';

export const createTransferSchema = Joi.object({
    productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
        'any.required': 'Product ID is required'
    }),
    fromStoreId: Joi.string().required().messages({
        'string.empty': 'Source store is required',
        'any.required': 'Source store is required'
    }),
    toStoreId: Joi.string().required().disallow(Joi.ref('fromStoreId')).messages({
        'string.empty': 'Destination store is required',
        'any.required': 'Destination store is required',
        'any.invalid': 'Source and destination stores cannot be the same'
    }),
    quantity: Joi.number().required().integer().min(1).messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
    }),
    reason: Joi.string().optional().max(500).messages({
        'string.max': 'Reason cannot exceed 500 characters'
    }),
    notes: Joi.string().optional().max(1000).messages({
        'string.max': 'Notes cannot exceed 1000 characters'
    })
}).options({ stripUnknown: true });

export const updateTransferSchema = Joi.object({
    status: Joi.string().valid(...Object.values(TransferStatus)).optional().messages({
        'any.only': `Status must be one of: ${Object.values(TransferStatus).join(', ')}`
    }),
    reason: Joi.string().optional().max(500).messages({
        'string.max': 'Reason cannot exceed 500 characters'
    }),
    notes: Joi.string().optional().max(1000).messages({
        'string.max': 'Notes cannot exceed 1000 characters'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
}).options({ stripUnknown: true });

export const approveTransferSchema = Joi.object({
    notes: Joi.string().optional().max(500).messages({
        'string.max': 'Notes cannot exceed 500 characters'
    })
}).options({ stripUnknown: true });

export const completeTransferSchema = Joi.object({
    notes: Joi.string().optional().max(500).messages({
        'string.max': 'Notes cannot exceed 500 characters'
    })
}).options({ stripUnknown: true });

export const rejectTransferSchema = Joi.object({
    reason: Joi.string().required().min(5).max(500).messages({
        'string.empty': 'Rejection reason is required',
        'string.min': 'Reason must be at least 5 characters',
        'string.max': 'Reason cannot exceed 500 characters',
        'any.required': 'Rejection reason is required'
    })
}).options({ stripUnknown: true });

export const cancelTransferSchema = Joi.object({
    reason: Joi.string().optional().max(500).messages({
        'string.max': 'Reason cannot exceed 500 characters'
    })
}).options({ stripUnknown: true });

export const transferFilterSchema = Joi.object({
    productId: Joi.string().optional().messages({
        'string.empty': 'Product ID cannot be empty'
    }),
    fromStoreId: Joi.string().optional().messages({
        'string.empty': 'Source store ID cannot be empty'
    }),
    toStoreId: Joi.string().optional().messages({
        'string.empty': 'Destination store ID cannot be empty'
    }),
    status: Joi.string().valid(...Object.values(TransferStatus)).optional().messages({
        'any.only': `Status must be one of: ${Object.values(TransferStatus).join(', ')}`
    }),
    initiatedBy: Joi.string().optional().messages({
        'string.empty': 'Initiator ID cannot be empty'
    }),
    startDate: Joi.date().optional().messages({
        'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().optional().messages({
        'date.base': 'End date must be a valid date'
    }),
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