// utils/validators.ts
import { body } from 'express-validator';

export const registerValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long'),
];

export const loginValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long')
];
