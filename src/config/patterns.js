/**
 * Forbidden patterns configuration.
 * Defines an array of regular expressions representing forbidden patterns in user prompts.
 * @file
 * @module config/patterns
 */

/**
 * Array of regular expressions representing forbidden patterns in user prompts.
 * These patterns are checked against user input to prevent jailbreak attempts
 * and other security concerns.
 * @type {RegExp[]}
 */
export const FORBIDDEN_PATTERNS = [
  /ignore previous/i,
  /ignore all instructions/i,
  /jailbreak/i,
  /bypass/i,
  /system prompt/i,
  /what is your prompt/i,
  /reveal your instructions/i,
  /act as /i,
  /pretend to be/i,
  /unleash/i,
  /developer mode/i,
  /dan /i,
]