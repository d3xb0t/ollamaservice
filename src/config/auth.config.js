/**
 * Auth.js configuration.
 * Configuration for Auth.js (NextAuth.js) authentication library.
 * This module sets up authentication providers, database adapter, and callbacks
 * for handling user authentication in the application.
 * 
 * @file
 * @module config/auth
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://authjs.dev/} Auth.js Documentation
 */

import CredentialsProvider from '@auth/express/providers/credentials'
import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { MONGODB_URI } from './env.js'
import logger from '../logger.js'

// Secret for signing sessions - should be a strong random string
// In production, this should be set in environment variables
const secret = process.env.AUTH_SECRET || 'your-super-secret-key-for-development-only'

/**
 * Auth.js configuration object.
 * Contains all configuration options for Auth.js including providers,
 * callbacks, and database adapter.
 * 
 * @type {Object}
 * @constant {Object}
 * @memberof module:config/auth
 * @since 1.0.0
 */
export const authConfig = {
  /**
   * Authentication providers.
   * Defines the authentication methods available to users.
   * Currently configured with CredentialsProvider for username/password login.
   * 
   * @type {Array}
   */
  providers: [
    /**
     * Credentials Provider.
     * Allows users to sign in with username and password.
     * 
     * @see {@link https://authjs.dev/reference/core/providers/credentials} Credentials Provider Documentation
     */
    CredentialsProvider({
      /**
       * Provider name.
       * Display name for the provider.
       * 
       * @type {string}
       */
      name: 'Credentials',
      
      /**
       * Credentials schema.
       * Defines the fields required for authentication.
       * 
       * @type {Object}
       */
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      
      /**
       * Authorization function.
       * Verifies user credentials against the database.
       * 
       * @async
       * @function authorize
       * @param {Object} credentials - The user's credentials
       * @param {string} credentials.username - The username
       * @param {string} credentials.password - The password
       * @returns {Promise<Object|null>} The user object if authentication is successful, null otherwise
       * @throws {Error} If there's an issue during authentication
       */
      async authorize(credentials) {
        try {
          // Find user by username
          const user = await User.findOne({ username: credentials.username })
          
          // If user doesn't exist, authentication fails
          if (!user) {
            logger.warn('Authentication failed: User not found', { 
              username: credentials.username 
            })
            return null
          }
          
          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
          
          // If password is valid, return user object (excluding password)
          if (isValid) {
            logger.info('Authentication successful', { 
              userId: user._id, 
              username: user.username 
            })
            
            // Return user object without sensitive information
            const { hashedPassword, ...userWithoutPassword } = user.toObject()
            return userWithoutPassword
          } else {
            logger.warn('Authentication failed: Invalid password', { 
              userId: user._id, 
              username: user.username 
            })
            return null
          }
        } catch (error) {
          logger.error('Authentication error', { 
            error: error.message,
            stack: error.stack 
          })
          throw error
        }
      }
    })
  ],
  
  /**
   * Secret for signing tokens.
   * Should be a strong random string.
   * 
   * @type {string}
   */
  secret,
  
  /**
   * Session configuration.
   * Defines session behavior and strategy.
   * 
   * @type {Object}
   */
  session: {
    /**
     * Session strategy.
     * Determines how sessions are managed.
     * 
     * @type {string}
     */
    strategy: 'jwt'
  },
  
  /**
   * Callbacks.
   * Custom functions to control behavior.
   * 
   * @type {Object}
   */
  callbacks: {
    /**
     * Session callback.
     * Modifies the session object.
     * 
     * @async
     * @function session
     * @param {Object} params - Callback parameters
     * @param {Object} params.session - The session object
     * @param {Object} params.user - The user object
     * @param {Object} params.token - The JWT token
     * @returns {Promise<Object>} The modified session object
     */
    async session({ session, user, token }) {
      // If user is available (first login), attach to session
      if (user) {
        session.user = user
      }
      
      // Attach token data to session if needed
      if (token) {
        session.accessToken = token.accessToken
      }
      
      return session
    },
    
    /**
     * JWT callback.
     * Modifies the JWT token.
     * 
     * @async
     * @function jwt
     * @param {Object} params - Callback parameters
     * @param {Object} params.token - The JWT token
     * @param {Object} params.user - The user object
     * @param {Object} params.account - The account object
     * @param {Object} params.profile - The profile object
     * @param {boolean} params.isNewUser - Whether this is a new user
     * @returns {Promise<Object>} The modified token object
     */
    async jwt({ token, user, account, profile, isNewUser }) {
      // If user is available (first login), attach to token
      if (user) {
        token.user = user
      }
      
      return token
    }
  },
  
  /**
   * Events.
   * Functions that are triggered on authentication events.
   * 
   * @type {Object}
   */
  events: {
    /**
     * Sign in event.
     * Triggered when a user signs in.
     * 
     * @async
     * @function signIn
     * @param {Object} params - Event parameters
     * @param {Object} params.user - The user object
     * @param {Object} params.account - The account object
     * @param {Object} params.profile - The profile object
     * @returns {Promise<void>}
     */
    async signIn({ user, account, profile }) {
      logger.info('User signed in', { 
        userId: user._id, 
        username: user.username, 
        accountType: account?.type 
      })
    },
    
    /**
     * Sign out event.
     * Triggered when a user signs out.
     * 
     * @async
     * @function signOut
     * @param {Object} params - Event parameters
     * @param {Object} params.session - The session object
     * @returns {Promise<void>}
     */
    async signOut({ session }) {
      logger.info('User signed out', { 
        userId: session?.user?._id, 
        username: session?.user?.username 
      })
    }
  },
  
  /**
   * Pages customization.
   * Customize built-in pages.
   * 
   * @type {Object}
   */
  pages: {
    /**
     * Sign in page.
     * Custom sign in page path.
     * 
     * @type {string}
     */
    signIn: '/login'
  },
  
  /**
   * Debug mode.
   * Enable debug output.
   * 
   * @type {boolean}
   */
  debug: process.env.NODE_ENV === 'development'
}

export default authConfig