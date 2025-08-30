/**
 * Authentication controller.
 * Handles user registration and authentication requests.
 * This module provides functions for creating new user accounts
 * and managing authentication-related operations.
 * 
 * @file
 * @module controller/auth
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 */

import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { asyncErrorHandler } from '../utils.js'
import logger from '../logger.js'

/**
 * Registers a new user account.
 * Creates a new user in the database with a hashed password.
 * 
 * @async
 * @function register
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.username - The desired username
 * @param {string} req.body.password - The desired password
 * @param {string} [req.body.email] - The user's email (optional)
 * @param {Object} res - The HTTP response object
 * @returns {Promise<void>}
 * @memberof module:controller/auth
 * @since 1.0.0
 * 
 * @example
 * // Register a new user
 * app.post('/auth/register', register)
 */
export const register = asyncErrorHandler(async (req, res) => {
  const { username, password, email } = req.body
  
  // Validate required fields
  if (!username || !password) {
    logger.warn('Registration failed: Missing required fields', { 
      username, 
      hasPassword: !!password,
      requestId: req.requestId 
    })
    
    return res.status(400).json({ 
      error: 'Username and password are required' 
    })
  }
  
  // Validate password strength
  if (password.length < 6) {
    logger.warn('Registration failed: Password too short', { 
      username, 
      passwordLength: password.length,
      requestId: req.requestId 
    })
    
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    })
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    })
    
    if (existingUser) {
      logger.warn('Registration failed: User already exists', { 
        username, 
        email,
        existingUserId: existingUser._id,
        requestId: req.requestId 
      })
      
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      })
    }
    
    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create new user
    const newUser = new User({
      username,
      email,
      hashedPassword
    })
    
    // Save user to database
    const savedUser = await newUser.save()
    
    logger.info('User registered successfully', { 
      userId: savedUser._id, 
      username: savedUser.username,
      requestId: req.requestId 
    })
    
    // Return success response (without password)
    const { hashedPassword: _, ...userWithoutPassword } = savedUser.toObject()
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    logger.error('Registration error', { 
      error: error.message,
      stack: error.stack,
      username,
      email,
      requestId: req.requestId 
    })
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ 
        error: 'Validation error', 
        details: errors 
      })
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    })
  }
})

export default {
  register
}