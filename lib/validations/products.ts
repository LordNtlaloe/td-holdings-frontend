import Joi from 'joi';

export enum ProductType {
    TIRE = 'TIRE',
    BALE = 'BALE'
}

export enum ProductGrade {
    A = 'A',
    B = 'B',
    C = 'C'
}

export enum TireCategory {
    NEW = 'NEW',
    SECOND_HAND = 'SECOND_HAND'
}

export enum TireUsage {
    FOUR_BY_FOUR = 'FOUR_BY_FOUR',
    REGULAR = 'REGULAR',
    TRUCK = 'TRUCK'
}

export const createProductSchema = Joi.object({
    name: Joi.string().required().min(2).max(200).messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name cannot exceed 200 characters',
        'any.required': 'Product name is required'
    }),
    basePrice: Joi.number().required().positive().messages({
        'number.base': 'Base price must be a number',
        'number.positive': 'Base price must be positive',
        'any.required': 'Base price is required'
    }),
    type: Joi.string().required().valid(...Object.values(ProductType)).messages({
        'any.only': `Type must be one of: ${Object.values(ProductType).join(', ')}`,
        'any.required': 'Type is required'
    }),
    grade: Joi.string().required().valid(...Object.values(ProductGrade)).messages({
        'any.only': `Grade must be one of: ${Object.values(ProductGrade).join(', ')}`,
        'any.required': 'Grade is required'
    }),
    commodity: Joi.string().optional().allow('').max(100).messages({
        'string.max': 'Commodity cannot exceed 100 characters'
    }),

    // Tire-specific fields
    tireSpecific: Joi.when('type', {
        is: ProductType.TIRE,
        then: Joi.object({
            tireCategory: Joi.string().valid(...Object.values(TireCategory)).optional().messages({
                'any.only': `Tire category must be one of: ${Object.values(TireCategory).join(', ')}`
            }),
            tireUsage: Joi.string().valid(...Object.values(TireUsage)).optional().messages({
                'any.only': `Tire usage must be one of: ${Object.values(TireUsage).join(', ')}`
            }),
            tireSize: Joi.string().optional().max(50).messages({
                'string.max': 'Tire size cannot exceed 50 characters'
            }),
            loadIndex: Joi.string().optional().max(10).messages({
                'string.max': 'Load index cannot exceed 10 characters'
            }),
            speedRating: Joi.string().optional().max(5).messages({
                'string.max': 'Speed rating cannot exceed 5 characters'
            }),
            warrantyPeriod: Joi.string().optional().max(50).messages({
                'string.max': 'Warranty period cannot exceed 50 characters'
            })
        }).optional(),
        otherwise: Joi.forbidden()
    }),

    // Bale-specific fields
    baleSpecific: Joi.when('type', {
        is: ProductType.BALE,
        then: Joi.object({
            baleWeight: Joi.number().positive().optional().messages({
                'number.positive': 'Bale weight must be positive'
            }),
            baleCategory: Joi.string().optional().max(50).messages({
                'string.max': 'Bale category cannot exceed 50 characters'
            }),
            originCountry: Joi.string().optional().max(100).messages({
                'string.max': 'Origin country cannot exceed 100 characters'
            }),
            importDate: Joi.date().optional().messages({
                'date.base': 'Import date must be a valid date'
            })
        }).optional(),
        otherwise: Joi.forbidden()
    }),

    // Store assignments
    storeAssignments: Joi.array().items(
        Joi.object({
            storeId: Joi.string().required().messages({
                'string.empty': 'Store ID is required',
                'any.required': 'Store ID is required'
            }),
            initialQuantity: Joi.number().integer().min(0).optional().messages({
                'number.integer': 'Initial quantity must be an integer',
                'number.min': 'Initial quantity cannot be negative'
            }),
            storePrice: Joi.number().positive().optional().messages({
                'number.positive': 'Store price must be positive'
            })
        })
    ).optional()
}).options({ stripUnknown: true });

export const updateProductSchema = Joi.object({
    name: Joi.string().optional().min(2).max(200).messages({
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name cannot exceed 200 characters'
    }),
    basePrice: Joi.number().optional().positive().messages({
        'number.positive': 'Base price must be positive'
    }),
    grade: Joi.string().optional().valid(...Object.values(ProductGrade)).messages({
        'any.only': `Grade must be one of: ${Object.values(ProductGrade).join(', ')}`
    }),
    commodity: Joi.string().optional().allow('').max(100).messages({
        'string.max': 'Commodity cannot exceed 100 characters'
    }),

    // Tire-specific fields
    tireSpecific: Joi.object({
        tireCategory: Joi.string().valid(...Object.values(TireCategory)).optional().messages({
            'any.only': `Tire category must be one of: ${Object.values(TireCategory).join(', ')}`
        }),
        tireUsage: Joi.string().valid(...Object.values(TireUsage)).optional().messages({
            'any.only': `Tire usage must be one of: ${Object.values(TireUsage).join(', ')}`
        }),
        tireSize: Joi.string().optional().max(50).messages({
            'string.max': 'Tire size cannot exceed 50 characters'
        }),
        loadIndex: Joi.string().optional().max(10).messages({
            'string.max': 'Load index cannot exceed 10 characters'
        }),
        speedRating: Joi.string().optional().max(5).messages({
            'string.max': 'Speed rating cannot exceed 5 characters'
        }),
        warrantyPeriod: Joi.string().optional().max(50).messages({
            'string.max': 'Warranty period cannot exceed 50 characters'
        })
    }).optional(),

    // Bale-specific fields
    baleSpecific: Joi.object({
        baleWeight: Joi.number().positive().optional().messages({
            'number.positive': 'Bale weight must be positive'
        }),
        baleCategory: Joi.string().optional().max(50).messages({
            'string.max': 'Bale category cannot exceed 50 characters'
        }),
        originCountry: Joi.string().optional().max(100).messages({
            'string.max': 'Origin country cannot exceed 100 characters'
        }),
        importDate: Joi.date().optional().messages({
            'date.base': 'Import date must be a valid date'
        })
    }).optional()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
}).options({ stripUnknown: true });

export const assignProductToStoresSchema = Joi.object({
    storeIds: Joi.array().items(Joi.string().required()).required().min(1).messages({
        'array.min': 'At least one store ID is required',
        'array.base': 'Store IDs must be an array',
        'any.required': 'Store IDs are required'
    }),
    initialQuantities: Joi.object().pattern(
        Joi.string(),
        Joi.number().integer().min(0)
    ).optional().messages({
        'object.base': 'Initial quantities must be an object'
    })
}).options({ stripUnknown: true });

export const removeProductFromStoreSchema = Joi.object({
    storeId: Joi.string().required().messages({
        'string.empty': 'Store ID is required',
        'any.required': 'Store ID is required'
    })
}).options({ stripUnknown: true });

export const productFilterSchema = Joi.object({
    name: Joi.string().optional().messages({
        'string.empty': 'Name cannot be empty'
    }),
    type: Joi.string().valid(...Object.values(ProductType)).optional().messages({
        'any.only': `Type must be one of: ${Object.values(ProductType).join(', ')}`
    }),
    grade: Joi.string().valid(...Object.values(ProductGrade)).optional().messages({
        'any.only': `Grade must be one of: ${Object.values(ProductGrade).join(', ')}`
    }),
    commodity: Joi.string().optional().messages({
        'string.empty': 'Commodity cannot be empty'
    }),
    tireCategory: Joi.string().valid(...Object.values(TireCategory)).optional().messages({
        'any.only': `Tire category must be one of: ${Object.values(TireCategory).join(', ')}`
    }),
    tireUsage: Joi.string().valid(...Object.values(TireUsage)).optional().messages({
        'any.only': `Tire usage must be one of: ${Object.values(TireUsage).join(', ')}`
    }),
    minPrice: Joi.number().optional().positive().messages({
        'number.positive': 'Minimum price must be positive'
    }),
    maxPrice: Joi.number().optional().positive().messages({
        'number.positive': 'Maximum price must be positive'
    }),
    inStock: Joi.boolean().optional().messages({
        'boolean.base': 'In stock must be true or false'
    }),
    storeId: Joi.string().optional().messages({
        'string.empty': 'Store ID cannot be empty'
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

export const productStatisticsSchema = Joi.object({
    groupBy: Joi.string().valid('type', 'grade', 'tireCategory', 'tireUsage').default('type').messages({
        'any.only': 'Group by must be one of: type, grade, tireCategory, tireUsage'
    })
}).options({ stripUnknown: true });

export const lowStockReportSchema = Joi.object({
    threshold: Joi.number().integer().min(0).default(10).messages({
        'number.integer': 'Threshold must be an integer',
        'number.min': 'Threshold cannot be negative'
    })
}).options({ stripUnknown: true });

export const archiveProductSchema = Joi.object({
    reason: Joi.string().optional().max(500).messages({
        'string.max': 'Reason cannot exceed 500 characters'
    })
}).options({ stripUnknown: true });

export const productIdSchema = Joi.object({
    productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
        'any.required': 'Product ID is required'
    })
}).options({ stripUnknown: true });

// Pagination schema for consistent pagination
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