/**
 * User model.
 * Defines the Mongoose schema and model for storing user information in MongoDB.
 * This module provides the data structure for user accounts including
 * username, email, and hashed password for authentication.
 * 
 * @file
 * @module models/user
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://mongoosejs.com/docs/guide.html} Mongoose Schemas
 * @see {@link https://www.mongodb.com/docs/manual/core/data-models/} MongoDB Data Models
 */

import { Schema, model } from 'mongoose'

/**
 * Mongoose schema for users.
 * Defines the structure and validation rules for user documents.
 * 
 * @type {Schema}
 * @constant {Schema}
 * @memberof module:models/user
 * @since 1.0.0
 */
const userSchema = new Schema({
  /**
   * Unique username for the user.
   * Used for login and identification.
   * 
   * Characteristics:
   * - Unique across all users
   * - Required field
   * - Indexed for fast lookups
   * - Trimmed of whitespace
   */
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  /**
   * User's email address.
   * Used for communication and optional login.
   * 
   * Characteristics:
   * - Optional field
   * - Unique across all users
   * - Indexed for fast lookups
   * - Trimmed of whitespace
   * - Validated as email format
   */
  email: {
    type: String,
    unique: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  
  /**
   * Hashed password for the user.
   * Stored securely using bcrypt.
   * 
   * Characteristics:
   * - Required field
   * - Never stored in plain text
   * - Minimum length enforced
   */
  hashedPassword: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  /**
   * Schema options.
   * Configure timestamps and serialization behavior.
   */
  timestamps: true // Automatically adds createdAt and updatedAt fields
})

/**
 * Mongoose model for users.
 * Provides an interface to the MongoDB collection for storing user information.
 * 
 * @type {Model}
 * @constant {Model}
 * @memberof module:models/user
 * @since 1.0.0
 */
const User = model('User', userSchema)

export default User