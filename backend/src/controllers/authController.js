const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const register = asyncHandler(async (req, res) => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map(e => e.message);
        throw new ApiError(400, errorMessages.join(', '), errorMessages);
    }

    const { name, email, password } = parseResult.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password_hash
    });

    const token = generateToken(user._id);

    res.status(201).json(new ApiResponse(201, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        }
    }, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map(e => e.message);
        throw new ApiError(400, errorMessages.join(', '), errorMessages);
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    res.status(200).json(new ApiResponse(200, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        }
    }, 'Login successful'));
});

const getProfile = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            created_at: req.user.created_at
        }
    }, 'User profile retrieved successfully'));
});

const logout = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

module.exports = {
    register,
    login,
    getProfile,
    logout
};
