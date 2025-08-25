/**
 * Error audit model.
 * Defines the Mongoose schema and model for storing error audit logs in MongoDB.
 * @file
 * @module models/errorAudit
 */

import { Schema, model } from 'mongoose'

/**
 * Mongoose schema for error audit logs.
 * @type {Schema}
 */
const errorAuditSchema = new Schema({
  requestId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  error: {
    type: {
      name: String,
      message: String,
      stack: String,
      statusCode: Number
    },
    required: true
  },
  request: {
    type: {
      method: String,
      url: String,
      headers: Object,
      body: Object,
      query: Object,
      params: Object,
      ip: String,
      userAgent: String
    },
    required: true
  }
})

/**
 * Mongoose model for error audit logs.
 * @type {Model}
 */
const ErrorAudit = model('ErrorAudit', errorAuditSchema)

export default ErrorAudit