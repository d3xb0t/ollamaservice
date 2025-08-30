/**
 * Authentication middleware.
 * Provides functions to protect routes and handle user authentication state.
 * This module contains middleware functions that can be applied to routes
 * to ensure only authenticated users can access them.
 * 
 * @file
 * @module middleware/auth
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 */

import logger from '../logger.js'

/**
 * Middleware to protect routes that require authentication.
 * Checks if a user is authenticated by verifying the session.
 * If authenticated, attaches user information to the request object.
 * If not authenticated, returns a 401 Unauthorized error.
 * 
 * In test mode (NODE_ENV === 'test'), if a special header is present,
 * it will simulate an authenticated user.
 * 
 * @function requireAuth
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 * @memberof module:middleware/auth
 * @since 1.0.0
 * 
 * @example
 * // Protect a route with authentication
 * app.get('/protected', requireAuth, (req, res) => {
 *   res.json({ message: 'Hello authenticated user!', user: req.user })
 * })
 */
export const requireAuth = (req, res, next) => {
  // In test mode, check for special header to simulate authenticated user
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-auth'] === 'true') {
    req.auth = { 
      user: { 
        _id: 'test-user-id', 
        username: 'testuser',
        email: 'test@example.com'
      } 
    }
    req.user = req.auth.user
    return next()
  }
  
  // Check if user is authenticated through Auth.js
  // The exact property may vary depending on Auth.js configuration
  if (req.auth?.user) {
    // User is authenticated, attach user to request and proceed
    req.user = req.auth.user
    next()
  } else {
    // User is not authenticated, send 401 error
    logger.warn('Unauthorized access attempt', { 
      requestId: req.requestId,
      ip: req.ip,
      url: req.url 
    })
    
    res.status(401).json({ 
      error: 'Unauthorized: Please log in to access this resource' 
    })
  }
}

/**
 * Middleware to optionally attach user information to the request.
 * If a user is authenticated, attaches user information to the request object.
 * If not authenticated, allows the request to proceed without user information.
 * 
 * In test mode (NODE_ENV === 'test'), if a special header is present,
 * it will simulate an authenticated user.
 * 
 * @function optionalAuth
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 * @memberof module:middleware/auth
 * @since 1.0.0
 * 
 * @example
 * // Use optional authentication on a route
 * app.get('/profile', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     res.json({ message: 'Hello user!', user: req.user })
 *   } else {
 *     res.json({ message: 'Hello guest!' })
 *   }
 * })
 */
export const optionalAuth = (req, res, next) => {
  // In test mode, check for special header to simulate authenticated user
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-auth'] === 'true') {
    req.auth = { 
      user: { 
        _id: 'test-user-id', 
        username: 'testuser',
        email: 'test@example.com'
      } 
    }
    req.user = req.auth.user
    return next()
  }
  
  // Check if user is authenticated through Auth.js
  // The exact property may vary depending on Auth.js configuration
  if (req.auth?.user) {
    // User is authenticated, attach user to request
    req.user = req.auth.user
  }
  
  // Always proceed to the next middleware
  next()
}

export default {
  requireAuth,
  optionalAuth
}