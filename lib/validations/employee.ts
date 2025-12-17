import Joi from 'joi';
import { Role } from '@/types';

export enum EmployeeStatusEnum {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ON_LEAVE = 'ON_LEAVE',
    TERMINATED = 'TERMINATED'
}

export enum ReviewPeriodEnum {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}


export const createEmployeeSchema = Joi.object({
    userId: Joi.string().required().pattern(/^c[^\s]+$/),
    storeId: Joi.string().required().pattern(/^c[^\s]+$/),
    position: Joi.string().required().min(2).max(100).trim(),
    role: Joi.string().valid(...Object.values(Role)).required(),
    hireDate: Joi.date().max('now')
});

export const updateEmployeeSchema = Joi.object({
    position: Joi.string().min(2).max(100).trim(),
    role: Joi.string().valid(...Object.values(Role)),
    status: Joi.string().valid(...Object.values(EmployeeStatusEnum)),
    terminationDate: Joi.date().max('now')
}).min(1);

export const terminateEmployeeSchema = Joi.object({
    terminationDate: Joi.date().required().max('now'),
    reason: Joi.string().required().min(5).max(500).trim()
});

export const employeeFilterSchema = Joi.object({
    storeId: Joi.string().pattern(/^c[^\s]+$/),
    role: Joi.string().valid(...Object.values(Role)),
    position: Joi.string().trim(),
    status: Joi.string().valid(...Object.values(EmployeeStatusEnum)),
    search: Joi.string().trim().max(100)
});

export const transferEmployeeSchema = Joi.object({
    newStoreId: Joi.string().required().pattern(/^c[^\s]+$/),
    reason: Joi.string().required().min(5).max(500).trim()
});

export const performanceReviewSchema = Joi.object({
    period: Joi.string().valid(...Object.values(ReviewPeriodEnum)).required(),
    score: Joi.number().required().min(1).max(10),
    feedback: Joi.string().min(10).max(1000).trim(),
    goals: Joi.array().items(Joi.string().min(5).max(200)).min(1).max(10),
    strengths: Joi.array().items(Joi.string().min(5).max(200)).min(1).max(10),
    areasForImprovement: Joi.array().items(Joi.string().min(5).max(200)).min(1).max(10)
});

export const employeePerformanceReportSchema = Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year').default('month')
});