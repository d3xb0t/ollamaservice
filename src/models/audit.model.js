/**
 * Audit model.
 * Defines the Mongoose schema and model for storing audit logs in MongoDB.
 * @file
 * @module models/audit
 */

import { Schema, model } from 'mongoose'

/**
 * Mongoose schema for audit logs.
 * @type {Schema}
 */
const auditSchema = new Schema({
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
  method: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  headers: {
    type: Object,
    required: false
  },
  body: {
    type: Object,
    required: false
  },
  query: {
    type: Object,
    required: false
  },
  params: {
    type: Object,
    required: false
  },
  ip: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  responseStatus: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: false
  },
  userId: {
    type: String,
    required: false
  }
})

/**
 * Mongoose model for audit logs.
 * @type {Model}
 */
const Audit = model('Audit', auditSchema)

export default Audit