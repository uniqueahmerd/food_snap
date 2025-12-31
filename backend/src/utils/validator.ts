// utils/validators.ts
import { body } from 'express-validator';

export const registerValidator = [
    // body('username').trim().notEmpty().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password_hash').isLength({ min: 6 }).escape(),
];

export const loginValidator = [
    body('email').isEmail().normalizeEmail(),
    body('password_hash').isLength({ min: 6 }).escape()
];
